'use strict';

const EnsureModule = require('./EnsureModule');
const util = require('./util');

let nextId = 0;
let compilationMap = new Map();

class DividePlugin {
    constructor (options) {
        this.initOptions(options);
        this.ident = __filename + (nextId++); // eslint-disable-line no-path-concat
    }

    initOptions (options) {
        options = Object.assign({
            async: true,
            excludeChunks: []
        }, options);

        if (typeof options.chunks === 'string') {
            options.chunks = [options.chunks];
        }

        options.divide = Number(options.divide) || 0;
        options.size = Number(options.size) || 0;
        options.size = options.size * 1024; // KB to B

        this.options = options;
    }

    apply (compiler) {
        compiler.plugin('this-compilation', (compilation) => {
            // record the processed chunks
            this.entryChunkMap = {};

            compilation.plugin(['optimize-chunks', 'optimize-extracted-chunks'], (chunks) => {
                if (compilation[this.ident]) {
                    return;
                }

                compilation[this.ident] = true;

                compilationMap.set(compilation, new Set());

                // entry chunk run first
                let originChunks = [...chunks].sort((a, b) => {
                    return !util.isEntryChunk(a) && util.isEntryChunk(b) ? 1 : 0;
                });

                for (let chunk of originChunks) {
                    if (!this.isValidChunk(chunk, compilation)) {
                        continue;
                    }

                    compilationMap.get(compilation).add(chunk);

                    let bundleMethod = this.options.async ? 'doAsync' : 'doSync';

                    if (util.isAsyncChunk(chunk)) {
                        bundleMethod = 'doAsyncChunk';
                    }

                    let modulesMap = this.filterModules(util.getModules(chunk), bundleMethod);

                    let moduleGroups = this.splitModules(modulesMap.includeModules);

                    if (moduleGroups.length <= 1) {
                        continue;
                    }

                    this[bundleMethod](compiler, compilation, chunk, moduleGroups, modulesMap.excludeModules);
                }

                return true;
            });

            compilation.plugin('html-webpack-plugin-alter-chunks', (chunks, {plugin}) => {
                if (this.options.async) {
                    return chunks;
                }

                let sortMode = plugin.options.chunksSortMode;

                if (util.majorVersion >= 3 && typeof sortMode === 'undefined') {
                    sortMode = 'dependency';
                }

                let targetChunks = plugin.options.chunks || 'all';

                let excludeChunks = plugin.options.excludeChunks || [];

                // if html-webpack-plugin not specify chunks
                if (targetChunks === 'all' && !excludeChunks.length) {
                    return plugin.sortChunks(chunks, sortMode);
                }

                let allChunks = compilation.getStats().toJson().chunks;

                let ids = [];

                for (let name of Object.keys(this.entryChunkMap)) {
                    if (excludeChunks.indexOf(name) >= 0 ||
                        (targetChunks !== 'all' && targetChunks.indexOf(name) < 0)) {
                        continue;
                    }

                    let parent = compilation.namedChunks[name];

                    while (parent) {
                        ids.push(parent.id);
                        parent = parent.parents[0];
                    }
                }

                chunks = allChunks.filter((chunk) => {
                    return ids.indexOf(chunk.id) >= 0;
                });

                return plugin.sortChunks(chunks, sortMode);
            });

            compilation.plugin('done', () => {
                this.entryChunkMap = null;
                compilationMap.delete(compilation);
            });
        });
    }

    isValidChunk (chunk, compilation, reuse) {
        if (!reuse && compilationMap.get(compilation).has(chunk)) {
            return false;
        }

        if (util.isAsyncChunk(chunk)) {
            return util.getEntryChunk(chunk).some((entryChunk) =>
                this.isValidChunk(entryChunk, compilation, true));
        }

        // only entry chunk
        if (!util.isEntryChunk(chunk)) {
            return false;
        }

        if (chunk.name && this.options.excludeChunks.indexOf(chunk.name) > -1) {
            return false;
        }

        if (chunk.name && this.options.chunks) {
            return this.options.chunks.indexOf(chunk.name) > -1;
        }

        return true;
    }

    doSync (compiler, compilation, chunk, moduleGroups) {
        this.entryChunkMap[chunk.name] = chunk;

        moduleGroups = moduleGroups.reduce((groups, group) => {
            if (group.indexOf(util.getEntryModule(chunk)) < 0) {
                groups.push(group);
            }

            return groups;
        }, []);

        let lastChunk = chunk;

        for (let [index, group] of moduleGroups.entries()) {
            let bundledModuleChunk = this.bundleModules(group, chunk, index, compilation);

            lastChunk.parents = [bundledModuleChunk];

            bundledModuleChunk.addChunk(lastChunk);

            util.replaceChunk(bundledModuleChunk, lastChunk);

            lastChunk = bundledModuleChunk;
        }
    }

    doAsyncChunk (compiler, compilation, chunk, moduleGroups) {
        for (let [index, group] of moduleGroups.entries()) {
            const asyncChunk = this.bundleModules(group, chunk, index, compilation);

            asyncChunk.chunkReason = 'async split chunk';

            asyncChunk.extraAsync = true;

            for (let block of chunk.blocks) {
                block.chunks.unshift(asyncChunk);
                asyncChunk.addBlock(block);
            }

            for (let targetChunk of chunk.parents) {
                asyncChunk.addParent(targetChunk);
                targetChunk.addChunk(asyncChunk);
            }
        }
    }

    doAsync (compiler, compilation, chunk, moduleGroups, excludeModules) {
        this.entryChunkMap[chunk.name] = chunk;

        this.removeChunk(chunk, compilation);

        let ensureChunk = this.createChunk(compilation, chunk.name);
        let entryModule = util.getEntryModule(chunk);

        for (let [index, group] of moduleGroups.entries()) {
            let bundledModuleChunk = this.bundleModules(group, chunk, index, compilation);

            this.moveChildChunks(chunk, bundledModuleChunk);

            bundledModuleChunk.parents = [ensureChunk];

            ensureChunk.addChunk(bundledModuleChunk);
        }

        this.createEntryModule(
            compiler.context,
            `divide-entry-module_${chunk.name}`,
            ensureChunk,
            entryModule,
            compilation
        );

        for (let module of excludeModules) {
            ensureChunk.addModule(module);
            module.addChunk(ensureChunk);
        }

        this.moveChildChunks(chunk, ensureChunk);

        util.replaceChunk(ensureChunk, chunk);
    }

    moveChildChunks (oldChunk, newChunk) {
        oldChunk.chunks.forEach((asyncChunk) => {
            asyncChunk.origins.forEach((info) => {
                if (util.getModules(newChunk).indexOf(info.module) > -1 &&
                    newChunk.chunks.indexOf(asyncChunk) < 0) {
                    newChunk.addChunk(asyncChunk);

                    let originParentIndex = asyncChunk.parents.indexOf(oldChunk);

                    if (originParentIndex > -1) {
                        asyncChunk.parents.splice(originParentIndex, 1);
                    }

                    asyncChunk.addParent(newChunk);
                }
            });
        });
    }

    splitModules (modules) {
        let groups = [];
        let option = this.options;

        if (!modules.length || (option.divide <= 1 && !option.size)) {
            return [];
        }

        if (option.divide > 1) {
            let divide = Math.min(modules.length, option.divide);
            let num = Math.floor(modules.length / divide);
            let remainder = divide - modules.length % divide;

            Array.from(Array(divide))
                .map((value, i) => i < remainder ? num : num + 1)
                .reduce((start, count) => {
                    groups.push(modules.slice(start, start + count));
                    return start + count;
                }, 0);

            return groups;
        }

        for (let module of modules) {
            let size = module.size();
            let targetGroup = groups.filter(group => group.size + size < option.size)[0];

            if (!targetGroup) {
                targetGroup = {
                    size: 0,
                    list: []
                };
                groups.push(targetGroup);
            }

            targetGroup.list.push(module);
            targetGroup.size += size;
        }

        return groups.map(group => group.list);
    }

    filterModules (modules, method) {
        if (method !== 'doAsync') {
            return {
                includeModules: modules,
                excludeModules: []
            };
        }

        return (modules || []).reduce((map, module) => {
            let resource = module.resource || '';
            let request = module.request || '';

            if (resource.includes('node_modules/css-loader') ||
                resource.includes('node_modules/style-loader') ||
                request.includes('node_modules/css-loader') ||
                request.includes('node_modules/style-loader')
            ) {
                map.excludeModules.push(module);
            } else {
                map.includeModules.push(module);
            }

            return map;
        }, {
            includeModules: [],
            excludeModules: []
        });
    }

    createChunk (compilation, name) {
        let newChunk = compilation.addChunk(name);
        compilationMap.get(compilation).add(newChunk);
        return newChunk;
    }

    bundleModules (modules, oldChunk, index, compilation) {
        let chunkName = oldChunk.name ? `divide-chunk_${oldChunk.name}${index}` : '';
        let newChunk = this.createChunk(compilation, chunkName);

        for (let module of modules) {
            util.moveModule(oldChunk, module, newChunk);
        }

        compilationMap.get(compilation).add(newChunk);

        return newChunk;
    }

    removeChunk (chunk, compilation) {
        let index = compilation.chunks.indexOf(chunk);

        compilation.chunks.splice(index, 1);

        delete compilation.namedChunks[chunk.name];
    }

    createEntryModule (context, name, chunk, oldEntryModule, compilation) {
        let ensureModule = new EnsureModule({
            context: context,
            name: name,
            chunks: chunk.chunks,
            oldEntryModule: oldEntryModule
        });

        compilation.addModule(ensureModule);

        chunk.addModule(ensureModule);

        ensureModule.addChunk(chunk);

        chunk.addOrigin(ensureModule);

        // mark as entry
        util.setEntryModule(chunk, ensureModule);
    }
}

module.exports = DividePlugin;

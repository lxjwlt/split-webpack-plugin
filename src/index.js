'use strict';

const EnsureModule = require('./EnsureModule');
const ConcatSource = require('webpack-sources').ConcatSource;

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

                this.initEvent(compilation);

                for (let chunk of [...chunks]) {
                    if (!this.isValidChunk(chunk, compilation)) {
                        continue;
                    }

                    compilationMap.get(compilation).add(chunk);

                    let bundleMethod = this.options.async ? 'doAsync' : 'doSync';

                    if (this.isAsyncChunk(chunk)) {
                        bundleMethod = 'doAsyncChunk';
                    }

                    let modulesMap = this.filterModules(chunk.modules, bundleMethod);

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

                let targetChunks = plugin.options.chunks;

                // if html-webpack-plugin not specify chunks
                if (targetChunks === 'all' || !targetChunks) {
                    return chunks;
                }

                let allChunks = compilation.getStats().toJson().chunks;

                let excludeChunks = plugin.options.excludeChunks;

                let ids = [];

                for (let name of Object.keys(this.entryChunkMap)) {
                    if (excludeChunks.indexOf(name) >= 0 ||
                        targetChunks.indexOf(name) < 0) {
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

                return plugin.sortChunks(chunks, plugin.options.chunksSortMode);
            });

            compilation.plugin('done', () => {
                this.entryChunkMap = null;
                compilationMap.delete(compilation);
            });
        });
    }

    initEvent (compilation) {
        if (compilationMap.has(compilation)) {
            return;
        }

        compilationMap.set(compilation, new Set());

        compilation.mainTemplate.plugin('bootstrap', function (source, chunk) {
            if (chunk.chunks.length > 0) {
                return this.asString([
                    source,
                    '',
                    'var __parentWaitResolve = window.__webpackWaitResolve;',
                    'var __waitResolveChunks = {};',
                    `window.__webpackWaitResolve = function (chunkIds) {`,
                    this.indent([
                        'for(var i = 0;i < chunkIds.length; i++) {',
                        this.indent([
                            'var chunkId = chunkIds[i];',
                            'if(installedChunks[chunkId]) {',
                            this.indent([
                                '__waitResolveChunks[chunkId] = installedChunks[chunkId];',
                                'installedChunks[chunkId] = 0;'
                            ]),
                            '}'
                        ]),
                        '}',
                        'if(__parentWaitResolve) __parentWaitResolve(chunkIds);'
                    ]),
                    '};'
                ]);
            }

            return source;
        });

        compilation.chunkTemplate.plugin('render', function (oldSource, chunk) {
            if (!chunk.__isAsync) {
                return oldSource;
            }

            let source = new ConcatSource();

            source.add(`__webpackWaitResolve(${JSON.stringify(chunk.ids)});`);

            source.add('\n');

            source.add(oldSource);

            return source;
        });

        compilation.mainTemplate.plugin('require-extensions', function (source) {
            return this.asString([
                source,
                '',
                `${this.requireFn}._resolve = function (chunkIds) {`,
                this.indent([
                    'var chunkId, i = 0, resolves = [];',
                    'for(;i < chunkIds.length; i++) {',
                    this.indent([
                        'chunkId = chunkIds[i];',
                        'if(__waitResolveChunks[chunkId]) {',
                        this.indent([
                            'resolves.push(__waitResolveChunks[chunkId][0]);'
                        ]),
                        '}',
                        'installedChunks[chunkId] = 0;',
                        '__waitResolveChunks[chunkId] = undefined;'
                    ]),
                    '}',
                    'while(resolves.length) {',
                    this.indent([
                        'resolves.shift()();'
                    ]),
                    '}'
                ]),
                '};'
            ]);
        });

        compilation.mainTemplate.plugin('require-ensure', function (source) {
            return this.asString([
                'if(__waitResolveChunks[chunkId]) {',
                this.indent([
                    'return __waitResolveChunks[chunkId][2];'
                ]),
                '}',
                '',
                source
            ]);
        });
    }

    isValidChunk (chunk, compilation, reuse) {
        if (!reuse && compilationMap.get(compilation).has(chunk)) {
            return false;
        }

        if (this.isAsyncChunk(chunk)) {
            let entryChunk = this.getEntryChunk(chunk);
            return entryChunk
                ? this.isValidChunk(entryChunk, compilation, true) : false;
        }

        // only entry chunk
        if (!chunk.hasRuntime()) {
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

    getEntryChunk (chunk) {
        while (chunk) {
            if (chunk.hasRuntime()) {
                return chunk;
            }

            chunk = chunk.parents[0];
        }
    }

    isAsyncChunk (chunk) {
        return !chunk.hasRuntime() && !chunk.name;
    }

    doSync (compiler, compilation, chunk, moduleGroups) {
        this.entryChunkMap[chunk.name] = chunk;

        moduleGroups = moduleGroups.reduce((groups, group) => {
            if (group.indexOf(chunk.entryModule) < 0) {
                groups.push(group);
            }

            return groups;
        }, []);

        let lastChunk = chunk;

        for (let [index, group] of moduleGroups.entries()) {
            let bundledModuleChunk = this.bundleModules(group, chunk, index, compilation);

            lastChunk.parents = [bundledModuleChunk];

            bundledModuleChunk.addChunk(lastChunk);

            this.replaceChunk(bundledModuleChunk, lastChunk);

            lastChunk = bundledModuleChunk;
        }
    }

    doAsyncChunk (compiler, compilation, chunk, moduleGroups) {
        chunk.__isAsync = true;

        for (let [index, group] of moduleGroups.entries()) {
            let bundledModuleChunk = this.bundleModules(group, chunk, index, compilation);

            bundledModuleChunk.parents = [chunk];

            chunk.addChunk(bundledModuleChunk);
        }

        this.createEntryModule(
            compiler.context,
            null,
            chunk,
            chunk.entryModule,
            compilation,
            true
        );
    }

    doAsync (compiler, compilation, chunk, moduleGroups, excludeModules) {
        this.entryChunkMap[chunk.name] = chunk;

        this.removeChunk(chunk, compilation);

        let ensureChunk = this.createChunk(compilation, chunk.name);

        for (let [index, group] of moduleGroups.entries()) {
            let bundledModuleChunk = this.bundleModules(group, chunk, index, compilation);

            bundledModuleChunk.chunks = [...chunk.chunks];

            bundledModuleChunk.parents = [ensureChunk];

            ensureChunk.addChunk(bundledModuleChunk);
        }

        this.createEntryModule(
            compiler.context,
            `divide-entry-module_${chunk.name}`,
            ensureChunk,
            chunk.entryModule,
            compilation
        );

        for (let module of excludeModules) {
            ensureChunk.addModule(module);
            module.addChunk(ensureChunk);
        }

        this.replaceChunk(ensureChunk, chunk);
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
            if (module.resource.includes('node_modules/css-loader') ||
                module.resource.includes('node_modules/style-loader') ||
                module.request.includes('node_modules/css-loader') ||
                module.request.includes('node_modules/style-loader')) {
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
            oldChunk.moveModule(module, newChunk);
        }

        compilationMap.get(compilation).add(newChunk);

        return newChunk;
    }

    replaceChunk (newChunk, oldChunk) {
        for (let entrypoint of oldChunk.entrypoints) {
            entrypoint.insertChunk(newChunk, oldChunk);
        }
    }

    removeChunk (chunk, compilation) {
        let index = compilation.chunks.indexOf(chunk);

        compilation.chunks.splice(index, 1);

        delete compilation.namedChunks[chunk.name];
    }

    createEntryModule (context, name, chunk, oldEntryModule, compilation, needResolve) {
        let ensureModule = new EnsureModule({
            context: context,
            name: name,
            chunks: chunk.chunks,
            oldEntryModule: oldEntryModule,
            chunk: chunk,
            needResolve: needResolve
        });

        compilation.addModule(ensureModule);

        chunk.addModule(ensureModule);

        ensureModule.addChunk(chunk);

        chunk.addOrigin(ensureModule);

        // mark as entry
        chunk.entryModule = ensureModule;
    }
}

module.exports = DividePlugin;

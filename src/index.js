

'use strict';

const EnsureModule = require('./EnsureModule');

let nextId = 0;

class DividePlugin {

	constructor (options) {
		this.initOptions(options);
		this.ident = __filename + (nextId++);
	}

    initOptions (options) {

	    options = Object.assign({
            async: true,
            divideMode (count, divide) {
                return Math.floor(count / divide);
            },
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

				if(compilation[this.ident]) {
					return;
                }

				compilation[this.ident] = true;

                let bundleMethod = this.options.async ? 'doAsync' : 'doSync';

				for (let chunk of [...chunks]) {

					if (!this.isValidChunk(chunk)) {
					    continue;
                    }

					let moduleGroups = this.splitModules(chunk.modules);

					if (moduleGroups.length <= 1) {
						continue;
					}

					this.entryChunkMap[chunk.name] = chunk;

					this[bundleMethod](compiler, compilation, chunk, moduleGroups);
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
            });
		});
	}

    isValidChunk (chunk) {

	    // exclude non-entry chunk
        if (!chunk.hasRuntime()) {
            return false;
        }

        if (this.options.excludeChunks.indexOf(chunk.name) > -1) {
            return false;
        }

        if (this.options.chunks) {
            return this.options.chunks.indexOf(chunk.name) > -1;
        }

        return true;
    }

    doSync (compiler, compilation, chunk, moduleGroups) {

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

    doAsync (compiler, compilation, chunk, moduleGroups) {

        this.removeChunk(chunk, compilation);

        let ensureChunk = compilation.addChunk(chunk.name);

        for (let [index, group] of moduleGroups.entries()) {
            let bundledModuleChunk = this.bundleModules(group, chunk, index, compilation);

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

        this.replaceChunk(ensureChunk, chunk);
    }

	splitModules (modules) {
		let groups = [];
		let option = this.options;

		if (!modules.length || (option.divide <= 1 && !option.size)) {
			return [];
		}

		if (option.divide > 1) {
			let num = option.divideMode(modules.length, option.divide);

			num = Math.max(num, 1);

			if (num < modules.length) {
                for (let i = 0; i < modules.length; i += num) {
                    groups.push(modules.slice(i, i + num));
                }
			}

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

	bundleModules (modules, oldChunk, index, compilation) {
		let newChunk = compilation.addChunk(`divide-chunk_${oldChunk.name}${index}`);

		for (let module of modules) {
			oldChunk.moveModule(module, newChunk);
		}

		return newChunk;
	}

	replaceChunk (newChunk, oldChunk) {
		for(let entrypoint of oldChunk.entrypoints) {
			entrypoint.insertChunk(newChunk, oldChunk);
		}
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
        chunk.entryModule = ensureModule;
	}

}

module.exports = DividePlugin;

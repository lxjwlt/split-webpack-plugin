

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
            divideMode (count, divide) {
                return Math.floor(count / divide);
            },
            excludeChunks: []
        }, options);

	    if (typeof options.chunks === 'string') {
	        options.chunks = [options.chunks];
        }

        options.divide = Number(options.divide) || 0;
        options.maxSize = Number(options.maxSize) || 0;
        options.maxSize = options.maxSize * 1024; // KB to B

        this.options = options;
	}

	apply (compiler) {

		compiler.plugin('compilation', (compilation) => {
			compilation.plugin('optimize-chunks', (chunks) => {

				if(compilation[this.ident]) {
					return;
                }

				compilation[this.ident] = true;

				let currentChunks = [...chunks];

				for (let chunk of currentChunks) {

					if (!this.isValidChunk(chunk)) {
					    continue;
                    }

					let moduleGroups = this.splitModules(chunk.modules);

					if (moduleGroups.length <= 1) {
						continue;
					}

                    let oldEntryModule = chunk.entryModule;

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
                        oldEntryModule,
						compilation
					);

					this.replaceChunk(ensureChunk, chunk);
				}

				return true;
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

	splitModules (modules) {
		let groups = [];
		let option = this.options;

		if (!modules.length || (option.divide <= 1 && !option.maxSize)) {
			return [];
		}

		if (option.divide > 1) {
			let num = option.divideMode(modules.length, option.divide);

			if (num < modules.length) {
                for (let i = 0; i < modules.length; i += num) {
                    groups.push(modules.slice(i, i + num));
                }
			}

			return groups;
		}

		for (let module of modules) {
			let size = module.size();
			let targetGroup = groups.filter(group => group.size + size < option.maxSize)[0];

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

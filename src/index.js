

'use strict';

const EnsureModule = require('./EnsureModule');

let nextId = 0;

class DividePlugin {

	constructor(options) {
		this.initOptions(options);
		this.ident = __filename + (nextId++);
	}

    initOptions(options) {

		if(!Array.isArray(options)) {
			options = [options];
		}

		this.options = {};

		options.forEach((option) => {
			this.options[option.name || 'default'] = option;
		});

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

					// only entry chunk
					if (!chunk.hasRuntime()) {
						continue;
					}

					const option = this.options[chunk.name] || this.options.default;

					let moduleGroups = this.splitModules(chunk.modules, option);

					let oldEntryModule = chunk.entryModule;

					if (!moduleGroups.length) {
						return;
					}

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

	splitModules (modules, option) {
		let groups = [];

		if (!modules.length || option.division <= 1 || !option.maxSize) {
			return [];
		}

		if (option.division > 1) {
			let num = Math.floor(modules.length / option.division);

			if (num < modules.length) {
                for (let i = 0; i < modules.length; i += num) {
                    groups.push(modules.split(i, i + num));
                }
			}

			return groups;
		}

        let totalSize = 0;
        let group;

		for (let module of modules) {
			let size = module.size();

			totalSize = size + totalSize;

			if (totalSize > option.maxSize || !group) {
				group = [];
				groups.push(group);
				totalSize = size;
			}

			group.push(module);
		}

		return groups;
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

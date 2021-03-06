/**
 * @file util
 */

const util = {

    majorVersion: Number(require('webpack/package.json').version.split('.')[0]),

    isEntryChunk (chunk) {
        if (chunk.hasRuntime) {
            return chunk.hasRuntime();
        }

        return chunk.entry;
    },

    isAsyncChunk (chunk) {
        if (chunk.isInitial) {
            return !chunk.isInitial();
        }
        return !chunk.initial;
    },

    isEntryModule (chunk, module) {
        if (!module || chunk.modules.indexOf(module) < 0) {
            return false;
        }

        return chunk.entryModule === module ||
            (util.majorVersion <= 1 && module.id === 0);
    },

    getEntryModule (chunk) {
        if (chunk.entryModule) {
            return chunk.entryModule;
        }

        return chunk.entryModule ||
            chunk.modules.filter((module) => module.id === 0)[0];
    },

    setEntryModule (chunk, module) {
        if (util.majorVersion >= 2) {
            chunk.entryModule = module;
        } else {
            chunk.modules.forEach((module) => {
                if (module.id === 0) {
                    module.id = null;
                }
            });

            if (module) {
                module.id = 0;
            }
        }
    },

    replaceChunk (newChunk, oldChunk) {
        if (oldChunk.entrypoints) {
            for (let entrypoint of oldChunk.entrypoints) {
                entrypoint.insertChunk(newChunk, oldChunk);
            }
        } else {
            if (oldChunk.entry) {
                newChunk.entry = true;
                oldChunk.entry = false;
            }

            if (oldChunk.initial) {
                newChunk.initial = true;
            }
        }
    },

    getEntryChunk (chunk) {
        if (!chunk) {
            return [];
        }

        if (util.isEntryChunk(chunk)) {
            return [chunk];
        }

        let result = [];

        chunk.parents.forEach((parent) => {
            result = result.concat(util.getEntryChunk(parent));
        });

        return result;
    },

    moveModule (oldChunk, module, newChunk) {
        if (util.isEntryModule(oldChunk, module)) {
            util.setEntryModule(oldChunk, null);
        }

        if (oldChunk.moveModule) {
            oldChunk.moveModule(module, newChunk);
            return;
        }

        module.removeChunk(oldChunk);
        module.addChunk(newChunk);
        newChunk.addModule(module);
        module.rewriteChunkInReasons(oldChunk, [newChunk]);
    },

    getModules (chunk) {
        if (chunk.mapModules) {
            return chunk.mapModules();
        } else {
            return chunk.modules;
        }
    }

};

module.exports = util;

const path = require('path');
const webpack = require('webpack');
const rimraf = require('rimraf');
const assert = require('chai').assert;
const fs = require('fs-extra');
const DividePlugin = require('../');
const EnsureModule = require('../src/EnsureModule');
const TEMP_DIR = path.resolve(__dirname, './temp');
const OUTPUT_DIR = path.resolve(TEMP_DIR, 'dist');

describe('DivideWebpackPlugin', function () {

    this.timeout(0);

    beforeEach(function (done) {
        fs.remove(TEMP_DIR, done);
    });

    describe('async', function () {

        it('default', function (done) {
            testDividePlugin({
                entry: path.resolve(TEMP_DIR, './app'),
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin()
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    }
                },
                expectedResults: {
                    chunkNumber: 1
                }
            }, done);
        });

        it('divide each module', function (done) {
            testDividePlugin({
                entry: path.resolve(TEMP_DIR, './app'),
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        divide: 3
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    }
                },
                expectedResults: {
                    chunkNumber: 3,
                    ensureChunkNumber: 1
                }
            }, done);
        });

        it('divide greater than the length of modules', function (done) {
            testDividePlugin({
                entry: path.resolve(TEMP_DIR, './app'),
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        divide: 100
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    }
                },
                expectedResults: {
                    chunkNumber: 3,
                    ensureChunkNumber: 1
                }
            }, done);
        });

        it('divide when multiple entry chunks', function (done) {
            testDividePlugin({
                entry: {
                    app: path.resolve(TEMP_DIR, './app'),
                    login: path.resolve(TEMP_DIR, './login')
                },
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        divide: 2
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    },
                    './login': {
                        './util': {
                            './other': true,
                            './test': true
                        }
                    }
                },
                expectedResults: {
                    chunkNumber: 5,
                    ensureChunkNumber: 2
                }
            }, done);
        });

        it('divide results float number', function (done) {
            testDividePlugin({
                entry: path.resolve(TEMP_DIR, './app'),
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        divide: 2
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    }
                },
                expectedResults: {
                    chunkNumber: 3,
                    ensureChunkNumber: 1
                }
            }, done);
        });

        it('invalid divide number', function (done) {
            testDividePlugin({
                entry: path.resolve(TEMP_DIR, './app'),
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        divide: 1
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    }
                },
                expectedResults: {
                    chunkNumber: 1,
                    ensureChunkNumber: 0
                }
            }, done);
        });

        it('divide mode to deal with float part', function (done) {
            testDividePlugin({
                entry: path.resolve(TEMP_DIR, './app'),
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        divide: 2,
                        divideMode (count, divide) {
                            assert.strictEqual(count, 3);
                            assert.strictEqual(divide, 2);

                            return Math.ceil(count / divide);
                        }
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    }
                },
                expectedResults: {
                    chunkNumber: 2,
                    ensureChunkNumber: 1
                }
            }, done);
        });

        it('invalid number return from divide mode', function (done) {
            testDividePlugin({
                entry: path.resolve(TEMP_DIR, './app'),
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        divide: 2,
                        divideMode () {
                            return 0;
                        }
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    }
                },
                expectedResults: {
                    chunkNumber: 3,
                    ensureChunkNumber: 1
                }
            }, done);
        });

        it('big number return from divide mode', function (done) {
            testDividePlugin({
                entry: path.resolve(TEMP_DIR, './app'),
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        divide: 2,
                        divideMode () {
                            return 100;
                        }
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    }
                },
                expectedResults: {
                    chunkNumber: 1,
                    ensureChunkNumber: 0
                }
            }, done);
        });

        it('add specific chunks', function (done) {
            testDividePlugin({
                entry: {
                    app: path.resolve(TEMP_DIR, './app'),
                    login: path.resolve(TEMP_DIR, './login')
                },
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        chunks: ['login'],
                        divide: 2
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    },
                    './login': {
                        './util': {
                            './other': true,
                            './test': true
                        }
                    }
                },
                expectedResults: {
                    chunkNumber: 3,
                    ensureChunkNumber: 1
                }
            }, done);
        });

        it('empty chunks', function (done) {
            testDividePlugin({
                entry: {
                    app: path.resolve(TEMP_DIR, './app'),
                    login: path.resolve(TEMP_DIR, './login')
                },
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        chunks: [],
                        divide: 2
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    },
                    './login': {
                        './util': {
                            './other': true,
                            './test': true
                        }
                    }
                },
                expectedResults: {
                    chunkNumber: 2,
                    ensureChunkNumber: 0
                }
            }, done);
        });

        it('empty exclude chunks', function (done) {
            testDividePlugin({
                entry: {
                    app: path.resolve(TEMP_DIR, './app'),
                    login: path.resolve(TEMP_DIR, './login')
                },
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        excludeChunks: [],
                        divide: 2
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    },
                    './login': {
                        './util': {
                            './other': true,
                            './test': true
                        }
                    }
                },
                expectedResults: {
                    chunkNumber: 5,
                    ensureChunkNumber: 2
                }
            }, done);
        });

        it('exclude chunks', function (done) {
            testDividePlugin({
                entry: {
                    app: path.resolve(TEMP_DIR, './app'),
                    login: path.resolve(TEMP_DIR, './login')
                },
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        excludeChunks: ['login'],
                        divide: 2
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    },
                    './login': {
                        './util': {
                            './other': true,
                            './test': true
                        }
                    }
                },
                expectedResults: {
                    chunkNumber: 4,
                    ensureChunkNumber: 1
                }
            }, done);
        });

        it('include and exclude chunks', function (done) {
            testDividePlugin({
                entry: {
                    app: path.resolve(TEMP_DIR, './app'),
                    login: path.resolve(TEMP_DIR, './login')
                },
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        chunks: ['login'],
                        excludeChunks: ['login'],
                        divide: 2
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    },
                    './login': {
                        './util': {
                            './other': true,
                            './test': true
                        }
                    }
                },
                expectedResults: {
                    chunkNumber: 2,
                    ensureChunkNumber: 0
                }
            }, done);
        });

        it('by size', function (done) {
            testDividePlugin({
                entry: path.resolve(TEMP_DIR, './app'),
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        size: 10
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    }
                },
                sizes: {
                    './app': 1,
                    './common': 14,
                    './test': 2
                },
                expectedResults: {
                    chunkNumber: 2,
                    ensureChunkNumber: 1
                }
            }, done);
        });

        it('by big size', function (done) {
            testDividePlugin({
                entry: path.resolve(TEMP_DIR, './app'),
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        size: 1000
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    }
                },
                sizes: {
                    './app': 1,
                    './common': 14,
                    './test': 2
                },
                expectedResults: {
                    chunkNumber: 1,
                    ensureChunkNumber: 0
                }
            }, done);
        });

        it('invalid size', function (done) {
            testDividePlugin({
                entry: path.resolve(TEMP_DIR, './app'),
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        size: 0
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    }
                },
                sizes: {
                    './app': 1,
                    './common': 14,
                    './test': 2
                },
                expectedResults: {
                    chunkNumber: 1,
                    ensureChunkNumber: 0
                }
            }, done);
        });

        it('divide and size', function (done) {
            testDividePlugin({
                entry: path.resolve(TEMP_DIR, './app'),
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        size: 1,
                        divide: 2
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true,
                        './other': true
                    }
                },
                sizes: {
                    './app': 1,
                    './common': 14,
                    './test': 2,
                    './other': 3
                },
                expectedResults: {
                    chunkNumber: 2,
                    ensureChunkNumber: 1
                }
            }, done);
        });
    });

    describe('sync', function () {

        it('default', function (done) {
            testDividePlugin({
                entry: path.resolve(TEMP_DIR, './app'),
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        async: false
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    }
                },
                expectedResults: {
                    chunkNumber: 1,
                    ensureChunkNumber: 0
                }
            }, done);
        });

        it('divide each module', function (done) {
            testDividePlugin({
                entry: path.resolve(TEMP_DIR, './app'),
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        divide: 3,
                        async: false
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    }
                },
                expectedResults: {
                    chunkNumber: 3,
                    ensureChunkNumber: 0
                }
            }, done);
        });

        it('by size', function (done) {
            testDividePlugin({
                entry: path.resolve(TEMP_DIR, './app'),
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        size: 10,
                        async: false
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    }
                },
                sizes: {
                    './app': 1,
                    './common': 14,
                    './test': 2
                },
                expectedResults: {
                    chunkNumber: 2,
                    ensureChunkNumber: 0
                }
            }, done);
        });

        it('3parts', function (done) {
            testDividePlugin({
                entry: path.resolve(TEMP_DIR, './app'),
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        size: 100,
                        async: false
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true,
                        'jquery': true
                    }
                },
                sizes: {
                    './app': 1,
                    './common': 14,
                    './test': 2
                },
                expectedResults: {
                    chunkNumber: 2,
                    ensureChunkNumber: 0
                }
            }, done);
        });

    });

    describe('multiple apply', function () {

        it('default', function (done) {
            testDividePlugin({
                entry: path.resolve(TEMP_DIR, './app'),
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin(),
                    new DividePlugin()
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true
                    }
                },
                expectedResults: {
                    chunkNumber: 1,
                    ensureChunkNumber: 0
                }
            }, done);
        });

        it('different options', function (done) {
            testDividePlugin({
                entry: {
                    app: path.resolve(TEMP_DIR, './app'),
                    login: path.resolve(TEMP_DIR, './login')
                },
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        chunks: ['app'],
                        divide: 2
                    }),
                    new DividePlugin({
                        chunks: ['login'],
                        size: 10
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true,
                        './lib': true
                    },
                    './login': {
                        './util': {
                            './other': true,
                            './test': true,
                            './lib': true
                        }
                    }
                },
                sizes: {
                    './login': 3,
                    './util': 67,
                    './other': 5,
                    './test': 12,
                    './lib': 1
                },
                expectedResults: {
                    chunkNumber: 5,
                    ensureChunkNumber: 2
                }
            }, done);
        });

        it('different mode', function (done) {
            testDividePlugin({
                entry: {
                    app: path.resolve(TEMP_DIR, './app'),
                    login: path.resolve(TEMP_DIR, './login')
                },
                output: {
                    path: OUTPUT_DIR,
                    filename: '[name].js'
                },
                plugins: [
                    new DividePlugin({
                        chunks: ['app'],
                        divide: 2,
                        async: false
                    }),
                    new DividePlugin({
                        chunks: ['login'],
                        size: 10
                    })
                ]
            }, {
                files: {
                    './app': {
                        './common': true,
                        './test': true,
                        './lib': true
                    },
                    './login': {
                        './util': {
                            './other': true,
                            './test': true,
                            './lib': true
                        }
                    }
                },
                sizes: {
                    './login': 3,
                    './util': 67,
                    './other': 5,
                    './test': 12,
                    './lib': 1
                },
                expectedResults: {
                    chunkNumber: 5,
                    ensureChunkNumber: 1
                }
            }, done);
        });

    });

});

function testDividePlugin (webpackConfig, options, done) {

    createResource(options.files, options.sizes).then(() => {

        webpack(webpackConfig, function (err, stats) {

            let compilation = stats.compilation;

            let expectedResults = options.expectedResults;

            assert.ifError(err);

            assert.isFalse(stats.hasErrors());
            assert.isFalse(stats.hasWarnings());

            let entry = stats.compilation.options.entry;

            entry = typeof entry === 'string' ? {
                main: entry
            } : entry;

            let dividePlugins = compilation.options.plugins.filter((plugin) => plugin instanceof DividePlugin);

            for (let dividePlugin of dividePlugins) {
                let async = true;

                if (dividePlugin) {
                    async = dividePlugin.options.async;
                }

                let chunks = stats.compilation.chunks;

                let normalChunks = chunks.filter((chunk) => {
                    return chunk.modules.every((module) => !(module instanceof EnsureModule));
                });

                let ensureChunks = chunks.filter((chunk) => {
                    return chunk.modules.every((module) => module instanceof EnsureModule);
                });

                assert.strictEqual(normalChunks.length, expectedResults.chunkNumber);

                assert.strictEqual(ensureChunks.length, expectedResults.ensureChunkNumber || 0);

                if (!async) {
                    let files = !dividePlugin.options.chunks ?
                        Object.keys(options.files) : dividePlugin.options.chunks.map((path) => {
                            return entry[path];
                        });

                    for (let chunkPath of files) {
                        chunkPath = path.resolve(TEMP_DIR, chunkPath);

                        let topModule = compilation.modules.filter((module) =>
                        module.resource && module.resource.indexOf(chunkPath) === 0)[0];

                        assert.isOk(topModule);

                        let topChunk = chunks.filter((chunk) => {
                            return chunk.modules.indexOf(topModule) > -1;
                        })[0];

                        assert.isOk(topChunk);

                        let allChunks = [];

                        let subChunk = topChunk;

                        while (subChunk) {
                            allChunks.push(subChunk);
                            subChunk = subChunk.parents[0];
                        }

                        testChunkChain(topChunk, allChunks, options.files, stats);
                    }

                    done();

                    return;
                }

                for (let chunk of ensureChunks) {
                    let content = chunk.modules[0]._source.source();
                    let subChunkName = `divide-chunk_${chunk.name}`;

                    let subChunks = normalChunks.filter((normalChunk) =>
                    normalChunk.name.indexOf(subChunkName) === 0);

                    assert.sameMembers(subChunks, chunk.chunks);

                    let entryModule = compilation.modules.filter((module) => {
                        return module.resource && module.resource.indexOf(entry[chunk.name]) === 0;
                    })[0];

                    subChunks.forEach((subChunk) => {
                        assert.include(content, `__webpack_require__.e(${subChunk.id})`);
                    });

                    assert.include(content, `__webpack_require__(${entryModule.id})`);

                    assert.include(chunk.entrypoints[0].chunks, chunk);

                    testChunkChain(chunk, chunk.chunks, options.files, stats);

                }
            }

            done();
        });

    });
}

function testChunkChain (topChunk, chunks, files, stats) {
    let moduleNames = chunks.reduce((names, subChunk) => {
        return names.concat(subChunk.modules.map((module) => module.resource));
    }, []);

    let entry = stats.compilation.options.entry;

    entry = typeof entry === 'string' ? {
        main: entry
    } : entry;

    let filePath = Object.keys(files).filter((filePath) => {
        return entry[topChunk.name] === path.resolve(TEMP_DIR, filePath);
    })[0];

    assert.sameMembers(
        flatObjectNames(files[filePath]).concat(filePath).map((filePath) => {
            return filePath.match(/^\./) ?
                path.resolve(TEMP_DIR, filePath) + '.js' :
                require.resolve(filePath);
        }),
        moduleNames
    );
}

function createResource (option, sizes) {
    return fs.ensureDir(TEMP_DIR).then(() => createFiles(option, sizes));
}

function createFiles (option, sizes) {
    let all = [];

    if (typeof option !== 'object') {
        return Promise.resolve();
    }

    for (let filePath of Object.keys(option)) {

        // skip 3parts
        if (!filePath.match(/^\./)) {
            continue;
        }

        let dependency = option[filePath];
        let data = typeof dependency === 'object' ?
            Object.keys(dependency).map((subPath) => `require("${subPath}")`) : [];

        let filename = filePath.replace(/[^a-z0-9\-]+/, '');

        data.push(
            sizes && sizes[filePath] ? `"${'a'.repeat(sizes[filePath] * 1024)}"` : '',
            `exports.name = "${filename}"`
        );

        all.push(
            fs.outputFile(path.resolve(TEMP_DIR, `${filePath}.js`), data.join('\n')),
            createFiles(dependency, sizes)
        );
    }

    return Promise.all(all);
}

function flatObjectNames (obj) {
    if (typeof obj !== 'object') {
        return [];
    }

    let names = Object.keys(obj);

    for (let name of names) {
        names = names.concat(flatObjectNames(obj[name]));
    }

    return names;
}

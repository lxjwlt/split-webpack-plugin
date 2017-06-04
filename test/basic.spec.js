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

        it('divide result float part', function (done) {
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

    });

});

function testDividePlugin (webpackConfig, options, done) {

    createResource(options.files).then(() => {

        webpack(webpackConfig, function (err, stats) {

            debugger;

            let compilation = stats.compilation;

            let expectedResults = options.expectedResults;

            assert.ifError(err);

            assert.isFalse(stats.hasErrors());
            assert.isFalse(stats.hasWarnings());

            let entry = stats.compilation.options.entry;

            entry = typeof entry === 'string' ? {
                main: entry
            } : entry;

            let chunks = stats.compilation.chunks;

            let normalChunks = chunks.filter((chunk) => {
                return chunk.modules.every((module) => !(module instanceof EnsureModule));
            });

            let ensureChunks = chunks.filter((chunk) => {
                return chunk.modules.every((module) => module instanceof EnsureModule);
            });

            assert.strictEqual(normalChunks.length, expectedResults.chunkNumber);

            if (expectedResults.ensureChunkNumber) {
                assert.strictEqual(ensureChunks.length, expectedResults.ensureChunkNumber);
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

                let moduleNames = chunk.chunks.reduce((names, subChunk) => {
                    names = names.concat(subChunk.modules.map((module) => {
                        return module.resource;
                    }));
                    return names;
                }, []);

                let filePath = Object.keys(options.files).filter((filePath) => {
                    return entry[chunk.name] === path.resolve(TEMP_DIR, filePath);
                })[0];

                assert.sameMembers(
                    flatObjectNames(options.files[filePath]).concat(filePath).map((filePath) => {
                        return path.resolve(TEMP_DIR, filePath) + '.js';
                    }),
                    moduleNames
                );

            }

            done();
        });

    });
}

function createResource (option) {
    return fs.ensureDir(TEMP_DIR).then(() => createFiles(option));
}

function createFiles (option) {
    let all = [];

    if (typeof option !== 'object') {
        return Promise.resolve();
    }

    for (let filePath of Object.keys(option)) {
        let dependency = option[filePath];
        let data = typeof dependency === 'object' ?
            Object.keys(dependency).map((subPath) => `require("${subPath}")`) : [];

        let filename = filePath.replace(/[^a-z0-9\-]+/, '');

        data.push(`exports.name = "${filename}"`);

        all.push(
            fs.outputFile(path.resolve(TEMP_DIR, `${filePath}.js`), data.join('\n')),
            createFiles(dependency)
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

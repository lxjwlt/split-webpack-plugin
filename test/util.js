const path = require('path');
const webpack = require('webpack');
const assert = require('chai').assert;
const fs = require('fs-extra');
const HtmlPlugin = require('html-webpack-plugin');
const Browser = require('zombie');

const TEMP_DIR = path.resolve(__dirname, './temp');
const OUTPUT_DIR = path.resolve(TEMP_DIR, 'dist');

exports.removeTempDir = function (callback) {
    fs.remove(TEMP_DIR, callback);
};

exports.createTest = function (files) {
    Object.keys(files).forEach((name) => {
        let file = files[name];
        file.path = path.resolve(TEMP_DIR, file.path, `${name}.js`);
        file.dependencies = file.dependencies || [];
    });

    return function (webpackConfig, config, done) {
        createResource(files).then(() => {
            if (webpackConfig.plugins.every((plugin) => !(plugin instanceof HtmlPlugin))) {
                webpackConfig.plugins.unshift(new HtmlPlugin());
            }

            let entry = config.expectedEntryMod || webpackConfig.entry;

            webpackConfig.context = TEMP_DIR;

            webpackConfig.entry = webpackConfig.entry.reduce((map, name) => {
                map[name] = files[name].path;
                return map;
            }, {});

            webpackConfig.output = Object.assign({
                path: OUTPUT_DIR,
                filename: '[name].js'
            }, webpackConfig.output);

            webpack(webpackConfig, function (err, stats) {
                assert.ifError(err);
                assert.isFalse(stats.hasErrors());
                assert.isFalse(stats.hasWarnings());

                let browser = new Browser();
                let pagePath = path.resolve(TEMP_DIR, './dist/index.html');

                browser.visit(`file://${pagePath}`, function () {
                    browser.assert.success('script no error');

                    assert.deepEqual(
                        browser.window.mods,
                        getAllFiles(files, entry).reduce((map, name) => {
                            map[name] = {
                                dependencies: files[name].dependencies
                            };
                            return map;
                        }, {})
                    );

                    browser.assert.elements(
                        'body script', config.expectedEntry,
                        `expect ${config.expectedEntry} entry`
                    );

                    browser.assert.elements(
                        'script', config.chunks,
                        `expect ${config.chunks} chunks`
                    );

                    done();
                });
            });
        });
    };
};

function getAllFiles (files, entry) {
    let data = entry;

    entry.forEach((name) => {
        data = data.concat(getAllFiles(files, files[name].dependencies));
    });

    return data;
}

function createResource (files) {
    return fs.ensureDir(TEMP_DIR).then(() => createFiles(files));
}

function createFiles (files) {
    let all = [];

    for (let name of Object.keys(files)) {
        let file = files[name];
        let data = [];
        let dependencies = file.dependencies.map((dependencyName) => {
            let relativePath = path.relative(
                path.dirname(file.path),
                path.dirname(files[dependencyName].path)
            );
            relativePath = path.join(
                relativePath, path.basename(files[dependencyName].path)
            );
            return `require("./${relativePath}")`;
        });

        data.push(

            file.ensure ? 'require.ensure([], function () {' : '',

            `(window.mods = window.mods || {})["${name}"] = {`,

            `   dependencies: [`,

            `       ` + dependencies.join(', '),

            `   ]`,

            `};`,

            file.ensure ? '});' : '',

            `module.exports = "${name}";`,

            file.size ? `"${'a'.repeat(file.size * 1024)}"` : ''
        );

        all.push(
            fs.outputFile(file.path, data.join('\n'))
        );
    }

    return Promise.all(all);
}

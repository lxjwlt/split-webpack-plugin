const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const webpack = require('webpack');
const {majorVersion} = require('../src/util');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

if (majorVersion <= 1) {
    let extractOriginal = ExtractTextPlugin.extract;
    ExtractTextPlugin.extract = function (options) {
        return extractOriginal(options.fallback, options.use);
    };
}

let examples = fs.readdirSync(__dirname).filter(function (file) {
    return fs.statSync(path.join(__dirname, file)).isDirectory();
});

examples.forEach(function (exampleName) {
    let examplePath = path.join(__dirname, exampleName);
    let config = require(path.join(examplePath, 'webpack.config.js'));
    let distPath = path.resolve(examplePath, 'dist', `webpack-${majorVersion}`);

    fse.remove(distPath);

    config.context = examplePath;

    config.output.path = distPath;

    if (config.module && config.module.rules) {

        config.module.loaders = config.module.rules.map((rule) => {
            let loaderName = Array.isArray(rule.use) ?
                'loaders' : 'loader';
            return {
                test: rule.test,
                [loaderName]: rule.use
            };
        });
    }

    webpack(config, function (err, stats) {
        console.log(stats.toString({
            colors: true
        }));
    });
});

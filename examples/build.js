const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const webpack = require('webpack');
const {majorVersion} = require('../src/util');
const parseConfig = require('./parse-webpack-config');

let examples = fs.readdirSync(__dirname).filter(function (file) {
    return fs.statSync(path.join(__dirname, file)).isDirectory();
});

examples.forEach(function (exampleName) {
    let examplePath = path.join(__dirname, exampleName);
    let config = parseConfig(require(path.join(examplePath, 'webpack.config.js')));
    let distPath = path.resolve(examplePath, 'dist', `webpack-${majorVersion}`);

    fse.remove(distPath);

    config.context = examplePath;

    config.output.path = distPath;

    webpack(config, function (err, stats) {
        console.log(stats.toString({
            colors: true
        }));
    });
});

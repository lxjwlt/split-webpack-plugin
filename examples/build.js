const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const webpack = require('webpack');

let examples = fs.readdirSync(__dirname).filter(function (file) {
    return fs.statSync(path.join(__dirname, file)).isDirectory();
});

examples.forEach(function (exampleName) {
    let examplePath = path.join(__dirname, exampleName);
    let config = require(path.join(examplePath, 'webpack.config.js'));
    let distPath = path.resolve(examplePath, './dist');

    fse.remove(distPath);

    Object.assign(config, {
        context: examplePath,
        output: {
            path: distPath
        }
    });

    webpack(config, function (err, stats) {
        console.log(stats.toString({
            colors: true
        }));
    });
});

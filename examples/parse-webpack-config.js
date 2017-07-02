/**
 * @file compatible all version webpack config
 */

const {majorVersion} = require('../src/util');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

if (majorVersion <= 1 && !ExtractTextPlugin.__inited) {
    ExtractTextPlugin.__inited = true;
    let extractOriginal = ExtractTextPlugin.extract;
    ExtractTextPlugin.extract = function (options) {
        return extractOriginal(options.fallback, options.use);
    };
}

module.exports = function (config) {

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

    return config;
};

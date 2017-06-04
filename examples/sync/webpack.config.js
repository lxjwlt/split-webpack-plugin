const path = require('path');
const DividePlugin = require('../..');
const HtmlPlguin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: {
        app: './index.js',
        cmd: './cmd.js'
    },
    output: {
        filename: '[name].js',
        pathinfo: true
    },
    plugins: [
        new DividePlugin({
            size: 100,
            async: false
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'verdor'
        }),
        new HtmlPlguin()
    ]
};

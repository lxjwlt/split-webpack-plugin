const path = require('path');
const DividePlugin = require('../..');
const HtmlPlguin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './cmd.js',
    output: {
        filename: '[name].js',
        pathinfo: true
    },
    plugins: [
        new DividePlugin({
            async: false,
            divide: 3
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'verdor'
        }),
        new HtmlPlguin()
    ]
};

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
        path: path.resolve(__dirname, './dist'),
        pathinfo: true
    },
    plugins: [
        new DividePlugin({
            // chunks: ['cmd', 'app'],
            // divideMode: function (count, divide) {
            //     return Math.ceil(count / divide);
            // },
            divide: 2,
            async: false
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'verdor'
        }),
        new HtmlPlguin({
            chunks: ['cmd']
        })
    ]
};

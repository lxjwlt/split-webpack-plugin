const DividePlugin = require('../..');
const HtmlPlguin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: './index.js',
        login: './login.js'
    },
    output: {
        filename: '[name].js'
    },
    plugins: [
        new DividePlugin({
            chunks: ['app'],
            divide: 2
        }),
        new DividePlugin({
            chunks: ['login'],
            size: 100
        }),
        new HtmlPlguin(),
        new HtmlPlguin({
            filename: 'app.html',
            chunks: ['app']
        }),
        new HtmlPlguin({
            filename: 'login.html',
            chunks: ['login']
        })
    ]
};

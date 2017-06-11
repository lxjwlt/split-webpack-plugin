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
            chunk: ['app'],
            divide: 2,
            divideMode (count, divide) {
                return Math.ceil(count / divide);
            }
        }),
        new DividePlugin({
            chunk: ['login'],
            divide: 100
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

const DividePlugin = require('../..');
const HtmlPlguin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: './index.js'
    },
    output: {
        filename: '[name].js'
    },
    plugins: [
        new DividePlugin({
            divide: 100
        }),
        new HtmlPlguin()
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            }
        ]
    }
};

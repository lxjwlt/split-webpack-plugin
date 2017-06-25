const DividePlugin = require('../..');
const HtmlPlguin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

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
        new ExtractTextPlugin("styles.css"),
        new HtmlPlguin()
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            }
        ]
    }
};

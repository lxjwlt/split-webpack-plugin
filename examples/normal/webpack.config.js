const path = require('path');
const DividePlugin = require('../..');

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
            maxSize: 200 // KB
        })
    ]
};

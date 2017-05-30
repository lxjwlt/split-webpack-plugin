# divide-webpack-plugin

![Node version][node-image] [![NPM version][npm-image]][npm-url]

This is a [webpack](http://webpack.github.io/) plugin for Automating division process of files. That can be more helpful while we should divide all files manually, especially using multiple third-party libraries. You can simply divide your files by number which specify count of chunks or size of each chunk.

## Installation

Install divide-webpack-plugin with npm:

```
npm install divide-webpack-plugin -D
```

## Usage

Add the plugin to webpack config:

```javascript
var DivideWebpackPlugin = require('divide-webpack-plugin');
var webpackConfig = {

    // ...

    plugins: [
        new DivideWebpackPlugin({
            maxSize: 512 // 512 KB
        })
    ]
};
```

Configuration:

- `maxSize`: Maximun size of each partitioned file divide from each entry chunk
- `divide`: The number of chunks which each files will be divided into. divide-plugin will ignore `option.maxSize` config, while you specify `option.divide`



[npm-url]: https://www.npmjs.com/package/divide-webpack-plugin
[npm-image]: https://img.shields.io/npm/v/divide-webpack-plugin.svg
[node-image]: https://img.shields.io/node/v/divide-webpack-plugin.svg

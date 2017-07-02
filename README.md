# divide-webpack-plugin

![Node version][node-image]
[![NPM version][npm-image]][npm-url]
[![Build status](https://travis-ci.org/lxjwlt/split-webpack-plugin.svg)](https://travis-ci.org/lxjwlt/split-webpack-plugin)

This is a [webpack](http://webpack.github.io/) plugin for Automating segmentation process of files. That can be more helpful when we should split all files manually, especially using multiple third-party libraries. You can simply divide your files by size or the number of eventually segmented files.

> This plugin works with **webpack 1.x and 2.x**

## Installation

```
npm install split-webpack-plugin -D
```

## Usage

Add the plugin to [webpack plugins configure](https://webpack.js.org/concepts/plugins/):

```javascript
var DividePlugin = require('split-webpack-plugin');
var webpackConfig = {

    // ...

    plugins: [
        new DividePlugin({
            size: 512 // 512 KB
        })
    ]
};
```

## Configuration:

- `size`: The size of each partitioned block, measured in KB
- `async`: `true | false` default is `true`, the plugin uses `require.ensure` method to divide modules, convenient for us to insert every named entry chunks to html manually. check example: [sync](./examples/sync)

    But if there applies [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) in webpack, you can set `option.async` to false, html-webpack-plugin will put all segmented modules into html template automatically：

    ```javascript
    const DividePlugin = require('split-webpack-plugin');
    const HtmlPlugin = require('html-webpack-plugin');
    var webpackConfig = {

        // ...

        plugins: [
            new DivideWebpackPlugin({
                size: 512 // 512 KB,
                async: false
            }),
            new HtmlPlugin()
        ]
    };
    ```

    check example: [sync](./examples/sync).

- `chunks`: add some chunks in division process。e.g.Different config for different entries:

    ```javascript
        const DividePlugin = require('split-webpack-plugin');
        var webpackConfig = {

            entry: {
                app: './src/app.js',
                login: './src/login.js'
            },

            plugins: [
                new DivideWebpackPlugin({
                    chunks: ['app'],
                    size: 256 // 256 KB
                }),
                new DivideWebpackPlugin({
                    chunks: ['login'],
                    divide: 2
                })
            ]
        };
    ```

- `excludeChunks`: skip these chunks from division process
- `divide`: The number of partitioned block which each files will be divided into. The plugin will ignore `option.size` config, when `option.divide` greater than 1

## css

When `options.async:true`, divide-plugin would't partition the files that have been processed by `css-loader` or `style-loader`, so the css files can be loaded immediately. but a better way is to use [extract-text-webpack-plugin](https://github.com/webpack-contrib/extract-text-webpack-plugin)。check example: [extract-css](./examples/extract-css).

[npm-url]: https://www.npmjs.com/package/split-webpack-plugin
[npm-image]: https://img.shields.io/npm/v/split-webpack-plugin.svg
[node-image]: https://img.shields.io/node/v/split-webpack-plugin.svg

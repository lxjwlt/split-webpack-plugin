# split-webpack-plugin

![Node version][node-image]
[![NPM version][npm-image]][npm-url]
[![Build status](https://img.shields.io/travis/lxjwlt/split-webpack-plugin/dev.svg)](https://travis-ci.org/lxjwlt/split-webpack-plugin)
[![codecov](https://img.shields.io/codecov/c/github/lxjwlt/split-webpack-plugin/dev.svg)](https://codecov.io/gh/lxjwlt/split-webpack-plugin/branch/dev)


This is a [webpack](http://webpack.github.io/) plugin for Automating segmentation process of files. That can be more helpful when we should split all files manually, especially using multiple third-party libraries. You can simply divide your files by size or the number of eventually segmented files.

> This plugin works with **webpack 1.x, 2.x and 3.x**

## Installation

```
npm install split-webpack-plugin -D
```

## Usage

Add the plugin to [webpack plugins configure](https://webpack.js.org/concepts/plugins/#usage):

```javascript
var SplitPlugin = require('split-webpack-plugin');
var webpackConfig = {

    // ...

    plugins: [
        new SplitPlugin({
            size: 512 // 512 KB
        })
    ]
};
```

## Configuration:

- `size`: The size of each partitioned block, measured in KB
- `async`: `true | false` default is `true`, the plugin uses `require.ensure` method to divide modules, so we simply insert entry chunk to html manually to startup our app. check example: [async](./examples/async)

    however if plugins has applied [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) in webpack, you can set `option.async` to `false`, html-webpack-plugin will put all segmented chunks into html template automatically：

    ```javascript
    const DividePlugin = require('split-webpack-plugin');
    const HtmlPlugin = require('html-webpack-plugin');
    var webpackConfig = {

        entry: {
            app: './app.js'
        },
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

    Automatically generated html would be like:

    ```html
    <script type="text/javascript" src="divide-chunk_app0.js"></script>
    <script type="text/javascript" src="divide-chunk_app1.js"></script>
    <script type="text/javascript" src="app.js"></script>
    ```

    check example: [sync](./examples/sync).

- `chunks`: specific entry chunks in segmentation process, default is all entries. e.g.Different config for different entries:

    ```javascript
        const SplitPlugin = require('split-webpack-plugin');
        var webpackConfig = {
            entry: {
                app: './src/app.js',
                login: './src/login.js'
            },
            plugins: [
                new SplitPlugin({
                    chunks: ['app'],
                    size: 256 // 256 KB
                }),
                new SplitPlugin({
                    chunks: ['login'],
                    divide: 2
                })
            ]
        };
    ```

- `excludeChunks`: skip these chunks from segmentation process
- `divide`: The number of partitioned block which each files will be divided into. When `option.divide` greater than 1, `split-webpack-plugin` will ignore `option.size`.

## css

When `options.async:true`, divide-plugin would't partition the files that have been processed by `css-loader` or `style-loader`, so the css files can be loaded immediately. but a better way is to use [extract-text-webpack-plugin](https://github.com/webpack-contrib/extract-text-webpack-plugin). check example: [extract-css](./examples/extract-css).

All css files are bundled into one file:

```javascript
var webpackConfig = {
    plugins: [
        // ...
        new ExtractTextPlugin("styles.css")
    ]
};
```

Keep segmented css files:

```javascript
var webpackConfig = {
    plugins: [
        // ...
        new ExtractTextPlugin("[name].css")
    ]
};
```

[npm-url]: https://www.npmjs.com/package/split-webpack-plugin
[npm-image]: https://img.shields.io/npm/v/split-webpack-plugin.svg
[node-image]: https://img.shields.io/node/v/split-webpack-plugin.svg

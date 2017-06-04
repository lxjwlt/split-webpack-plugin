# divide-webpack-plugin

![Node version][node-image] [![NPM version][npm-image]][npm-url]

This is a [webpack](http://webpack.github.io/) plugin for Automating division process of files. That can be more helpful while we should divide all files manually, especially using multiple third-party libraries. You can simply divide your files by size or the number of modules each file contains.

## Installation

```
npm install divide-webpack-plugin -D
```

## Usage

Add the plugin to webpack config:

```javascript
var DividePlugin = require('divide-webpack-plugin');
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
- `divide`: The number of partitioned block which each files will be divided into. The plugin will ignore `option.size` config, when `option.divide` greater than 1
- `async`: `true | false` default is `true`, the plugin uses `require.ensure` method to divide modules, convenient for us to insert every named entry chunks to html manually. check example: [sync](./examples/sync)

    But if there applies [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) in webpack, you can set `option.async` to false, html-webpack-plugin will put all segmented modules into html template automatically：

    ```javascript
    const DividePlugin = require('divide-webpack-plugin');
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

- `chunks`: add some chunks in division process
- `excludeChunks`: skip these chunks from division process
- `divideMode`: the way to divide modules, default value is as follow:

    ```javascript
    {
        divide: 3,
        divideMode (modulesLength, divide) {
            // divide === 3

            return Math.floor(moduleLength / divide);
        }
    }
    ```

    If there are 4 modules in total, `divideMode` will return 1, that means creating 4 files, each containing only 1 module.

    we can use `Math.ceil` to allow each file to contain as many modules as possible:

    ```javascript
    {
        divide: 3,
        divideMode (modulesLength, divide) {
            return Math.ceil(moduleLength / divide);
        }
    }
    ```

    check example: [divide-mode](./examples/divide-mode).

[npm-url]: https://www.npmjs.com/package/divide-webpack-plugin
[npm-image]: https://img.shields.io/npm/v/divide-webpack-plugin.svg
[node-image]: https://img.shields.io/node/v/divide-webpack-plugin.svg

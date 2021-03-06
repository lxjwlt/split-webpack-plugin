'use strict';

const path = require('path');
const webpack = require('webpack');
const fs = require('fs-extra');
const dircompare = require('dir-compare');
const assert = require('chai').assert;
const OUTPUT_DIR = path.join(__dirname, '../dist');
const {majorVersion} = require('../src/util');
const parseConfig = require('../examples/parse-webpack-config');

describe('DivideWebpackPlugin Examples', function () {
    this.timeout(0);

    it('async example', function (done) {
        runExample('async', done);
    });

    it('extract css example', function (done) {
        runExample('extract-css', done);
    });

    it('none js example', function (done) {
        runExample('none-js-module', done);
    });

    it('sync example', function (done) {
        runExample('sync', done);
    });

    it('webpack-ensure example', function (done) {
        runExample('webpack-ensure', done);
    });
});

function runExample (exampleName, done) {
    const examplePath = path.resolve(__dirname, '..', 'examples', exampleName);
    const exampleOutput = path.join(OUTPUT_DIR, exampleName);
    const fixturePath = path.join(examplePath, 'dist', `webpack-${majorVersion}`);

    fs.remove(exampleOutput, function () {
        const options = parseConfig(require(path.join(examplePath, 'webpack.config.js')));

        options.context = examplePath;
        options.output.path = exampleOutput;

        webpack(options, function (err) {
            let res = dircompare.compareSync(fixturePath, exampleOutput, {
                compareSize: true
            });

            res.diffSet.filter(function (diff) {
                return diff.state === 'distinct';
            }).forEach(function (diff) {
                assert.strictEqual(
                    fs.readFileSync(path.join(diff.path1, diff.name1), 'utf-8').toString(),
                    fs.readFileSync(path.join(diff.path2, diff.name2), 'utf-8').toString()
                );
            });

            assert.isNotOk(err);

            assert.isTrue(res.same);

            done();
        });
    });
}

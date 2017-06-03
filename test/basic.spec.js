const path = require('path');
const rimraf = require('rimraf');
const OUTPUT_DIR = path.resolve(__dirname, '../dist');
const assert = require('chai').assert;

describe('DivideWebpackPlugin', function () {

    // beforeEach(function (done) {
    //     rimraf(OUTPUT_DIR, done);
    // });

    it('test', function () {
        assert.isOk(true)
    });

});

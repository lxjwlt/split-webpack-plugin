const DividePlugin = require('../');
const {createTest, removeTempDir} = require('./util');
const test = createTest({
    app: {
        path: './',
        dependencies: ['common', 'xlass']
    },
    login: {
        path: './',
        dependencies: ['common', 'util', 's250']
    },
    common: {
        path: './',
        dependencies: ['util', 'xlass']
    },
    util: {
        path: './lib',
        size: 1,
        dependencies: ['others']
    },
    others: {
        path: './lib'
    },
    xlass: {
        path: './lib',
        size: 5
    },
    s250: {
        path: './lib',
        size: 250
    }
});

describe('DivideWebpackPlugin', function () {
    this.timeout(0);

    beforeEach(function (done) {
        removeTempDir(done);
    });

    describe('async', function () {
        it('default', function (done) {
            test({
                entry: ['app'],
                plugins: [
                    new DividePlugin()
                ]
            }, {
                expectedEntry: 1,
                chunks: 1
            }, done);
        });

        it('divide module', function (done) {
            test({
                entry: ['app'],
                plugins: [
                    new DividePlugin({
                        divide: 3
                    })
                ]
            }, {
                expectedEntry: 1,
                chunks: 4
            }, done);
        });

        it('divide greater than the length of modules', function (done) {
            test({
                entry: ['app'],
                plugins: [
                    new DividePlugin({
                        divide: 100
                    })
                ]
            }, {
                expectedEntry: 1,
                chunks: 6
            }, done);
        });

        it('divide when multiple entry chunks', function (done) {
            test({
                entry: ['app', 'login'],
                plugins: [
                    new DividePlugin({
                        divide: 2
                    })
                ]
            }, {
                expectedEntry: 2,
                chunks: 6
            }, done);
        });

        it('invalid divide number', function (done) {
            test({
                entry: ['app', 'login'],
                plugins: [
                    new DividePlugin({
                        divide: 1
                    })
                ]
            }, {
                expectedEntry: 2,
                chunks: 2
            }, done);
        });

        it('add specific chunks', function (done) {
            test({
                entry: ['app'],
                plugins: [
                    new DividePlugin({
                        chunks: ['login'],
                        divide: 100
                    })
                ]
            }, {
                expectedEntry: 1,
                chunks: 1
            }, done);
        });

        it('empty chunks', function (done) {
            test({
                entry: ['app', 'login'],
                plugins: [
                    new DividePlugin({
                        chunks: [],
                        divide: 100
                    })
                ]
            }, {
                expectedEntry: 2,
                chunks: 2
            }, done);
        });

        it('exclude chunks', function (done) {
            test({
                entry: ['app', 'util'],
                plugins: [
                    new DividePlugin({
                        excludeChunks: ['app'],
                        divide: 2
                    })
                ]
            }, {
                expectedEntry: 2,
                chunks: 4
            }, done);
        });

        it('exclude no chunks', function (done) {
            test({
                entry: ['app'],
                plugins: [
                    new DividePlugin({
                        chunks: [],
                        divide: 100
                    })
                ]
            }, {
                expectedEntry: 1,
                chunks: 1
            }, done);
        });

        it('include and exclude chunks', function (done) {
            test({
                entry: ['login'],
                plugins: [
                    new DividePlugin({
                        chunks: ['login'],
                        excludeChunks: ['login'],
                        divide: 2
                    })
                ]
            }, {
                expectedEntry: 1,
                chunks: 1
            }, done);
        });

        it('by min size', function (done) {
            test({
                entry: ['app'],
                plugins: [
                    new DividePlugin({
                        size: 0.0000001
                    })
                ]
            }, {
                expectedEntry: 1,
                chunks: 6
            }, done);
        });

        it('by big size', function (done) {
            test({
                entry: ['app'],
                plugins: [
                    new DividePlugin({
                        size: 100
                    })
                ]
            }, {
                expectedEntry: 1,
                chunks: 1
            }, done);
        });

        it('invalid size', function (done) {
            test({
                entry: ['app'],
                plugins: [
                    new DividePlugin({
                        size: 0
                    })
                ]
            }, {
                expectedEntry: 1,
                chunks: 1
            }, done);
        });

        it('divide and size', function (done) {
            test({
                entry: ['app'],
                plugins: [
                    new DividePlugin({
                        size: 100,
                        divide: 2
                    })
                ]
            }, {
                expectedEntry: 1,
                chunks: 3
            }, done);
        });
    });

    describe('sync', function () {
        it('default', function (done) {
            test({
                entry: ['app'],
                plugins: [
                    new DividePlugin({
                        async: false
                    })
                ]
            }, {
                expectedEntry: 1,
                chunks: 1
            }, done);
        });

        it('divide module', function (done) {
            test({
                entry: ['app'],
                plugins: [
                    new DividePlugin({
                        divide: 2,
                        async: false
                    })
                ]
            }, {
                expectedEntry: 2,
                chunks: 2
            }, done);
        });

        it('divide each module', function (done) {
            test({
                entry: ['app'],
                plugins: [
                    new DividePlugin({
                        divide: 5,
                        async: false
                    })
                ]
            }, {
                expectedEntry: 5,
                chunks: 5
            }, done);
        });

        it('by size', function (done) {
            test({
                entry: ['login'],
                plugins: [
                    new DividePlugin({
                        size: 100,
                        async: false
                    })
                ]
            }, {
                expectedEntry: 2,
                chunks: 2
            }, done);
        });
    });

    describe('multiple apply', function () {
        it('default', function (done) {
            test({
                entry: ['app'],
                plugins: [
                    new DividePlugin(),
                    new DividePlugin()
                ]
            }, {
                expectedEntry: 1,
                chunks: 1
            }, done);
        });

        it('different options', function (done) {
            test({
                entry: ['app', 'login'],
                plugins: [
                    new DividePlugin({
                        chunks: ['app'],
                        divide: 2
                    }),
                    new DividePlugin({
                        chunks: ['login'],
                        size: 10
                    })
                ]
            }, {
                expectedEntry: 2,
                chunks: 6
            }, done);
        });

        it('different mode', function (done) {
            test({
                entry: ['app', 'login'],
                plugins: [
                    new DividePlugin({
                        chunks: ['app'],
                        divide: 2,
                        async: false
                    }),
                    new DividePlugin({
                        chunks: ['login'],
                        size: 10
                    })
                ]
            }, {
                expectedEntry: 3,
                chunks: 5
            }, done);
        });
    });
});

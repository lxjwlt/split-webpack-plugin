
require.ensure([], function () {
    const asyncMod = require('./lib/async');
    const asyncMod2 = require('./lib/async2');

    require.ensure([], function () {
        require('./lib/common');
        console.log('[index-mod] start');
    });
});

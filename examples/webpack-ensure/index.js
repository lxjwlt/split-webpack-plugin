
require.ensure([], function () {
    const asyncMod = require('./lib/async');
    const asyncMod2 = require('./lib/async2');
console.log('[index-mod] start');
});

require.ensure([], function () {
    require('./lib/common');
});

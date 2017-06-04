const common = require('./lib/common');

console.log('[index]', common.name);

require.ensure([], function () {
    const asyncMod = require('./lib/async');
    const asyncMod2 = require('./lib/async2');
})

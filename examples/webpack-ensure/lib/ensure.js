require.ensure([], function () {
    const asyncMod = require('./async');

    console.log('[ensure-mod] start')
});

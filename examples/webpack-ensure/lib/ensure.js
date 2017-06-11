require.ensure([], function () {
    require('./3parts');
    const asyncMod = require('./async');

    console.log('[ensure-mod] start')
});

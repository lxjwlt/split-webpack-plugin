require.ensure([], function () {
    require('./lib/3parts');
    const asyncMod = require('./lib/async');
    console.log('[login-mod] start');
});

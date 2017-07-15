const asyncMod = require('./lib/async');
const asyncMod2 = require('./lib/async2');

require.ensure(['./lib/common'], function (require) {
    require('./lib/common')
});

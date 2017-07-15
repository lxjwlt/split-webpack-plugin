const asyncMod = require('./lib/async');

require.ensure(['./lib/common'], function (require) {
    require('./lib/common')
});

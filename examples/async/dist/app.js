webpackJsonp([2],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(1);
__webpack_require__(2);
exports.name = 'common mod';


/***/ }),
/* 1 */
/***/ (function(module, exports) {

exports.name = 'xlass'


/***/ }),
/* 2 */
/***/ (function(module, exports) {

exports.name = 'other mod'


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

const common = __webpack_require__(0);

console.log('[index]', common.name);

__webpack_require__.e/* require.ensure */(0).then((function () {
    const asyncMod = __webpack_require__(4);
    const asyncMod2 = __webpack_require__(5);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe)


/***/ })
],[3]);
webpackJsonp([2],[
/* 0 */
/***/ (function(module, exports) {

exports.name = 'xlass'


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(0);
__webpack_require__(2);
exports.name = 'common mod';


/***/ }),
/* 2 */
/***/ (function(module, exports) {

exports.name = 'other mod'


/***/ }),
/* 3 */,
/* 4 */,
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

const common = __webpack_require__(1);

console.log('[index]', common.name);

__webpack_require__.e/* require.ensure */(0).then((function () {
    const asyncMod = __webpack_require__(6);
    const asyncMod2 = __webpack_require__(7);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe)


/***/ })
],[5]);
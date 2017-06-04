webpackJsonp([1],[
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
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(8);

exports.name = '3parts';


/***/ }),
/* 8 */,
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

const common = __webpack_require__(0);
const xlass = __webpack_require__(1);
__webpack_require__(7);

console.log('[cmd]', common.name);


/***/ })
]);
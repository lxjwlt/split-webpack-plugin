webpackJsonp([1],[
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(8);

exports.name = '3parts';


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

const common = __webpack_require__(1);
const xlass = __webpack_require__(0);
__webpack_require__(3);

console.log('[cmd]', common.name);


/***/ })
],[4]);
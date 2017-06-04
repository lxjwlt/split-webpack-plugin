webpackJsonp([2],[
/* 0 */
/* no static exports found */
/* all exports used */
/*!***********************!*\
  !*** ./lib/common.js ***!
  \***********************/
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ./xlass */ 1);
__webpack_require__(/*! ./other */ 2);
exports.name = 'common mod';


/***/ }),
/* 1 */
/* no static exports found */
/* all exports used */
/*!**********************!*\
  !*** ./lib/xlass.js ***!
  \**********************/
/***/ (function(module, exports) {

exports.name = 'xlass'


/***/ }),
/* 2 */
/* no static exports found */
/* all exports used */
/*!**********************!*\
  !*** ./lib/other.js ***!
  \**********************/
/***/ (function(module, exports) {

exports.name = 'other mod'


/***/ }),
/* 3 */
/* no static exports found */
/* all exports used */
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ (function(module, exports, __webpack_require__) {

const common = __webpack_require__(/*! ./lib/common */ 0);

console.log('[index]', common.name);

__webpack_require__.e/* require.ensure */(0).then((function () {
    const asyncMod = __webpack_require__(/*! ./lib/async */ 4);
    const asyncMod2 = __webpack_require__(/*! ./lib/async2 */ 5);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe)


/***/ })
],[3]);
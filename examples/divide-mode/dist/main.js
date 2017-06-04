webpackJsonp([1],[
/* 0 */,
/* 1 */
/* no static exports found */
/* all exports used */
/*!***********************!*\
  !*** ./lib/common.js ***!
  \***********************/
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! ./xlass */ 0);
__webpack_require__(/*! ./other */ 3);
exports.name = 'common mod';


/***/ }),
/* 2 */
/* no static exports found */
/* all exports used */
/*!****************!*\
  !*** ./cmd.js ***!
  \****************/
/***/ (function(module, exports, __webpack_require__) {

const common = __webpack_require__(/*! ./lib/common */ 1);
const xlass = __webpack_require__(/*! ./lib/xlass */ 0);

console.log('[cmd]', common.name);


/***/ })
],[2]);
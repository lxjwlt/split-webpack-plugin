webpackJsonp([3,5],[
/* 0 */,
/* 1 */
/*!***********************!*\
  !*** ./lib/common.js ***!
  \***********************/
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(/*! ./xlass */ 2);
	__webpack_require__(/*! ./other */ 3);
	exports.name = 'common mod';


/***/ }),
/* 2 */
/*!**********************!*\
  !*** ./lib/xlass.js ***!
  \**********************/
/***/ (function(module, exports) {

	exports.name = 'xlass'


/***/ }),
/* 3 */
/*!**********************!*\
  !*** ./lib/other.js ***!
  \**********************/
/***/ (function(module, exports) {

	exports.name = 'other mod'


/***/ }),
/* 4 */,
/* 5 */,
/* 6 */
/*!****************!*\
  !*** ./cmd.js ***!
  \****************/
/***/ (function(module, exports, __webpack_require__) {

	const common = __webpack_require__(/*! ./lib/common */ 1);
	const xlass = __webpack_require__(/*! ./lib/xlass */ 2);
	__webpack_require__(/*! ./lib/3parts */ 7);

	console.log('[cmd]', common.name);


/***/ }),
/* 7 */
/*!***********************!*\
  !*** ./lib/3parts.js ***!
  \***********************/
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(/*! jquery */ 8);

	exports.name = '3parts';


/***/ })
]);
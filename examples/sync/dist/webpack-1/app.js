webpackJsonp([0,4],[
/* 0 */
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ (function(module, exports, __webpack_require__) {

	const common = __webpack_require__(/*! ./lib/common */ 1);

	console.log('[index]', common.name);

	__webpack_require__.e/* nsure */(1, function () {
	    const asyncMod = __webpack_require__(/*! ./lib/async */ 4);
	    const asyncMod2 = __webpack_require__(/*! ./lib/async2 */ 5);
	})


/***/ }),
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


/***/ })
]);
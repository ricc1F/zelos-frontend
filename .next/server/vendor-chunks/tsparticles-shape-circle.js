"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/tsparticles-shape-circle";
exports.ids = ["vendor-chunks/tsparticles-shape-circle"];
exports.modules = {

/***/ "(ssr)/./node_modules/tsparticles-shape-circle/esm/CircleDrawer.js":
/*!*******************************************************************!*\
  !*** ./node_modules/tsparticles-shape-circle/esm/CircleDrawer.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   CircleDrawer: () => (/* binding */ CircleDrawer)\n/* harmony export */ });\n/* harmony import */ var tsparticles_engine__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tsparticles-engine */ \"(ssr)/./node_modules/tsparticles-engine/esm/Utils/Utils.js\");\n\nclass CircleDrawer {\n    draw(context, particle, radius) {\n        if (!particle.circleRange) {\n            particle.circleRange = { min: 0, max: Math.PI * 2 };\n        }\n        const circleRange = particle.circleRange;\n        context.arc(0, 0, radius, circleRange.min, circleRange.max, false);\n    }\n    getSidesCount() {\n        return 12;\n    }\n    particleInit(container, particle) {\n        const shapeData = particle.shapeData, angle = shapeData?.angle ?? {\n            max: 360,\n            min: 0,\n        };\n        particle.circleRange = !(0,tsparticles_engine__WEBPACK_IMPORTED_MODULE_0__.isObject)(angle)\n            ? {\n                min: 0,\n                max: (angle * Math.PI) / 180,\n            }\n            : { min: (angle.min * Math.PI) / 180, max: (angle.max * Math.PI) / 180 };\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvdHNwYXJ0aWNsZXMtc2hhcGUtY2lyY2xlL2VzbS9DaXJjbGVEcmF3ZXIuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBOEM7QUFDdkM7QUFDUDtBQUNBO0FBQ0EscUNBQXFDO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQyw0REFBUTtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBIiwic291cmNlcyI6WyJDOlxcVXNlcnNcXGVuZGVyXFxEb3dubG9hZHNcXFByb2pldG9DaGFtYWRhXFx6ZWxvcy1mcm9udGVuZFxcbm9kZV9tb2R1bGVzXFx0c3BhcnRpY2xlcy1zaGFwZS1jaXJjbGVcXGVzbVxcQ2lyY2xlRHJhd2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzT2JqZWN0IH0gZnJvbSBcInRzcGFydGljbGVzLWVuZ2luZVwiO1xuZXhwb3J0IGNsYXNzIENpcmNsZURyYXdlciB7XG4gICAgZHJhdyhjb250ZXh0LCBwYXJ0aWNsZSwgcmFkaXVzKSB7XG4gICAgICAgIGlmICghcGFydGljbGUuY2lyY2xlUmFuZ2UpIHtcbiAgICAgICAgICAgIHBhcnRpY2xlLmNpcmNsZVJhbmdlID0geyBtaW46IDAsIG1heDogTWF0aC5QSSAqIDIgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjaXJjbGVSYW5nZSA9IHBhcnRpY2xlLmNpcmNsZVJhbmdlO1xuICAgICAgICBjb250ZXh0LmFyYygwLCAwLCByYWRpdXMsIGNpcmNsZVJhbmdlLm1pbiwgY2lyY2xlUmFuZ2UubWF4LCBmYWxzZSk7XG4gICAgfVxuICAgIGdldFNpZGVzQ291bnQoKSB7XG4gICAgICAgIHJldHVybiAxMjtcbiAgICB9XG4gICAgcGFydGljbGVJbml0KGNvbnRhaW5lciwgcGFydGljbGUpIHtcbiAgICAgICAgY29uc3Qgc2hhcGVEYXRhID0gcGFydGljbGUuc2hhcGVEYXRhLCBhbmdsZSA9IHNoYXBlRGF0YT8uYW5nbGUgPz8ge1xuICAgICAgICAgICAgbWF4OiAzNjAsXG4gICAgICAgICAgICBtaW46IDAsXG4gICAgICAgIH07XG4gICAgICAgIHBhcnRpY2xlLmNpcmNsZVJhbmdlID0gIWlzT2JqZWN0KGFuZ2xlKVxuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgICAgIG1heDogKGFuZ2xlICogTWF0aC5QSSkgLyAxODAsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA6IHsgbWluOiAoYW5nbGUubWluICogTWF0aC5QSSkgLyAxODAsIG1heDogKGFuZ2xlLm1heCAqIE1hdGguUEkpIC8gMTgwIH07XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/tsparticles-shape-circle/esm/CircleDrawer.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/tsparticles-shape-circle/esm/index.js":
/*!************************************************************!*\
  !*** ./node_modules/tsparticles-shape-circle/esm/index.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   loadCircleShape: () => (/* binding */ loadCircleShape)\n/* harmony export */ });\n/* harmony import */ var _CircleDrawer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CircleDrawer */ \"(ssr)/./node_modules/tsparticles-shape-circle/esm/CircleDrawer.js\");\n\nasync function loadCircleShape(engine, refresh = true) {\n    await engine.addShape(\"circle\", new _CircleDrawer__WEBPACK_IMPORTED_MODULE_0__.CircleDrawer(), refresh);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvdHNwYXJ0aWNsZXMtc2hhcGUtY2lyY2xlL2VzbS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUE4QztBQUN2QztBQUNQLHdDQUF3Qyx1REFBWTtBQUNwRCIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxlbmRlclxcRG93bmxvYWRzXFxQcm9qZXRvQ2hhbWFkYVxcemVsb3MtZnJvbnRlbmRcXG5vZGVfbW9kdWxlc1xcdHNwYXJ0aWNsZXMtc2hhcGUtY2lyY2xlXFxlc21cXGluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENpcmNsZURyYXdlciB9IGZyb20gXCIuL0NpcmNsZURyYXdlclwiO1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRDaXJjbGVTaGFwZShlbmdpbmUsIHJlZnJlc2ggPSB0cnVlKSB7XG4gICAgYXdhaXQgZW5naW5lLmFkZFNoYXBlKFwiY2lyY2xlXCIsIG5ldyBDaXJjbGVEcmF3ZXIoKSwgcmVmcmVzaCk7XG59XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/tsparticles-shape-circle/esm/index.js\n");

/***/ })

};
;
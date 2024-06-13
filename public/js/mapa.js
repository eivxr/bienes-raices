/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/mapa.js":
/*!************************!*\
  !*** ./src/js/mapa.js ***!
  \************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n\r\n//mapa de \"crear nuevo anuncio\" \r\n(function() {\r\n    const lat = document.querySelector('#lat').value || 19.0401912;\r\n    const lng = document.querySelector('#lng').value ||-98.2745838;\r\n    const mapa = L.map('mapa').setView([lat, lng ], 12);\r\n    let marker; //pin\r\n\r\n    //utilizamos Provider y GeoCoder \r\n    const geocodeService = L.esri.Geocoding.geocodeService();\r\n\r\n    \r\n    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {\r\n        attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'\r\n    }).addTo(mapa);\r\n\r\n\r\n    //configuramos que el pin establezca las coordenadas del mapa cuando se arrastre\r\n    marker = new L.marker([lat, lng],{\r\n        draggable: true, //el pin puede ser arrastrado\r\n        autopan: true // centrado del mapa cuando se coloque\r\n        \r\n    }).addTo(mapa);\r\n\r\n    //al detectar el fin del movimiento en el pin, centramos el mapa a donde fue arrastado\r\n    marker.on('moveend', function(e){\r\n        marker = e.target;\r\n\r\n        const posicion = marker.getLatLng();\r\n\r\n        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));\r\n\r\n        //obtenemos informacion de donde fue arrastrado\r\n        geocodeService.reverse().latlng(posicion, 13).run(function(error, resultado){\r\n         \r\n            console.log(resultado)\r\n\r\n            marker.bindPopup(resultado.address.LongLabel);\r\n            \r\n            //en el renderizado de la vista crear.pug actualizaremos una etiqueta p que contara con el nombre de la calle\r\n            \r\n            document.querySelector('.calle').textContent = resultado.address?.Address ?? '';\r\n            //hacemos set en los inputs escondidos en la vista\r\n            document.querySelector('#calle').value = resultado?.address?.Address ?? '';\r\n            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';\r\n            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';\r\n        })\r\n\r\n    })\r\n})()\n\n//# sourceURL=webpack://bienesraices_mvc/./src/js/mapa.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/js/mapa.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;
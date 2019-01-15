(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(global, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/Modules/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/Modules/Authenticate/getBearerToken.ts":
/*!****************************************************!*\
  !*** ./src/Modules/Authenticate/getBearerToken.ts ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return getBearerToken; });\n\r\n;\r\nfunction getBearerToken(request) {\r\n    const header = request.get('Authorization');\r\n    if (header === undefined)\r\n        return { error: 'unavailable' };\r\n    const parts = header.split(' ');\r\n    const type = parts[0];\r\n    if (type !== 'Bearer')\r\n        return { error: 'invalidType' };\r\n    const token = parts[1];\r\n    if (!token)\r\n        return { error: 'missingToken' };\r\n    return token;\r\n}\r\n;\r\n\n\n//# sourceURL=webpack:///./src/Modules/Authenticate/getBearerToken.ts?");

/***/ }),

/***/ "./src/Modules/Authenticate/index.ts":
/*!*******************************************!*\
  !*** ./src/Modules/Authenticate/index.ts ***!
  \*******************************************/
/*! exports provided: default, AuthenticateCallbackUnavailableError */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return authenticate; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"AuthenticateCallbackUnavailableError\", function() { return AuthenticateCallbackUnavailableError; });\n/* harmony import */ var src_Modules_Utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/Modules/Utilities */ \"./src/Modules/Utilities/index.ts\");\n/* harmony import */ var src_Modules_Errors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/Modules/Errors */ \"./src/Modules/Errors.ts\");\n/* harmony import */ var _getBearerToken__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./getBearerToken */ \"./src/Modules/Authenticate/getBearerToken.ts\");\n\r\n\r\n\r\n\r\n\r\n;\r\n;\r\n;\r\n;\r\nasync function authenticate({ method, request, response, next }) {\r\n    if (!method.authenticate) {\r\n        next();\r\n        return;\r\n    }\r\n    ;\r\n    const appAuthentication = request.app.locals.config.authentication;\r\n    if (!appAuthentication)\r\n        throw new AuthenticateCallbackUnavailableError();\r\n    const appAuthenticationHelper = getAuthenticationHelper({ method, request });\r\n    let bearer;\r\n    if (appAuthenticationHelper === 'bearer' || appAuthenticationHelper === 'bearer-optional') {\r\n        const bearerResult = Object(_getBearerToken__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(request);\r\n        if (typeof bearerResult === 'object') {\r\n            if (method.authenticate === 'bearer' || bearerResult.error !== 'unavailable')\r\n                Object(src_Modules_Utilities__WEBPACK_IMPORTED_MODULE_0__[\"handleResourceError\"])({ response, apiError: src_Modules_Errors__WEBPACK_IMPORTED_MODULE_1__[\"BearerTokenMissing\"].generate() });\r\n            else if (method.authenticate === 'bearer-optional')\r\n                next();\r\n            return;\r\n        }\r\n        else {\r\n            bearer = bearerResult;\r\n        }\r\n        ;\r\n    }\r\n    ;\r\n    const paramaters = { method, request, response };\r\n    if (bearer)\r\n        paramaters.bearerToken = bearer;\r\n    const callback = typeof appAuthentication === 'function' ? appAuthentication : appAuthentication.callback;\r\n    let result;\r\n    try {\r\n        result = await callback(paramaters);\r\n    }\r\n    catch (error) {\r\n        Object(src_Modules_Utilities__WEBPACK_IMPORTED_MODULE_0__[\"handleResourceError\"])({ response, apiError: error instanceof src_Modules_Errors__WEBPACK_IMPORTED_MODULE_1__[\"ApiError\"] ? error : undefined });\r\n        return;\r\n    }\r\n    ;\r\n    if ('error' in result) {\r\n        Object(src_Modules_Utilities__WEBPACK_IMPORTED_MODULE_0__[\"handleResourceError\"])({ response, apiError: result.error });\r\n        return;\r\n    }\r\n    ;\r\n    if ('ignore' in result) {\r\n        next();\r\n        return;\r\n    }\r\n    ;\r\n    response.locals.authentication = result.data;\r\n    next();\r\n}\r\n;\r\nclass AuthenticateCallbackUnavailableError extends Error {\r\n    constructor() {\r\n        const message = 'Resource method sought authentication, but no authentication callback is available.';\r\n        super(message);\r\n    }\r\n    ;\r\n}\r\n;\r\nfunction getAuthenticationHelper({ method, request }) {\r\n    if (method.authenticate === 'bearer' || method.authenticate === 'bearer-optional')\r\n        return method.authenticate;\r\n    const authentication = request.app.locals.config.authentication;\r\n    if (typeof authentication === 'object' && (authentication.helper === 'bearer' || authentication.helper === 'bearer-optional'))\r\n        return authentication.helper;\r\n    return;\r\n}\r\n;\r\n\n\n//# sourceURL=webpack:///./src/Modules/Authenticate/index.ts?");

/***/ }),

/***/ "./src/Modules/Errors.ts":
/*!*******************************!*\
  !*** ./src/Modules/Errors.ts ***!
  \*******************************/
/*! exports provided: ApiError, UnexpectedError, InvalidBody, NotFound, BearerTokenMissing, UnauthorisedError, PluckRequired, PluckLong, PluckParse, PluckInvalid */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"ApiError\", function() { return ApiError; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"UnexpectedError\", function() { return UnexpectedError; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"InvalidBody\", function() { return InvalidBody; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"NotFound\", function() { return NotFound; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"BearerTokenMissing\", function() { return BearerTokenMissing; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"UnauthorisedError\", function() { return UnauthorisedError; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"PluckRequired\", function() { return PluckRequired; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"PluckLong\", function() { return PluckLong; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"PluckParse\", function() { return PluckParse; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"PluckInvalid\", function() { return PluckInvalid; });\n\r\nclass ApiError {\r\n    constructor(parameters) {\r\n        this.initialiseProperties(parameters);\r\n    }\r\n    ;\r\n    initialiseProperties(parameters) {\r\n        const keys = Object.keys(parameters);\r\n        for (let key of keys) {\r\n            const value = parameters[key];\r\n            this[key] = value;\r\n        }\r\n        ;\r\n    }\r\n    ;\r\n    toTransport() {\r\n        const transport = {\r\n            code: this.code,\r\n            message: this.message\r\n        };\r\n        return transport;\r\n    }\r\n    ;\r\n}\r\n;\r\n;\r\nclass UnexpectedError extends ApiError {\r\n    static generate() {\r\n        return new this();\r\n    }\r\n    ;\r\n    constructor() {\r\n        const parameters = {\r\n            code: 'unexpected',\r\n            status: 500\r\n        };\r\n        super(parameters);\r\n    }\r\n    ;\r\n}\r\n;\r\nclass InvalidBody extends ApiError {\r\n    static generate(reason) {\r\n        return new this(reason);\r\n    }\r\n    ;\r\n    constructor(reason) {\r\n        const parameters = {\r\n            code: 'invalidBody',\r\n            message: reason,\r\n            status: 400\r\n        };\r\n        super(parameters);\r\n    }\r\n    ;\r\n}\r\n;\r\nclass NotFound extends ApiError {\r\n    static generate(resource) {\r\n        return new this(resource);\r\n    }\r\n    ;\r\n    constructor(resource) {\r\n        const resourceName = typeof resource === 'string' ? resource : resource.name.substring(1);\r\n        const parameters = {\r\n            code: 'notFound',\r\n            status: 404,\r\n            resourceName\r\n        };\r\n        super(parameters);\r\n        this.resourceName = resourceName;\r\n    }\r\n    ;\r\n    toTransport() {\r\n        const transport = {\r\n            code: this.code,\r\n            message: this.message,\r\n            resourceName: this.resourceName\r\n        };\r\n        return transport;\r\n    }\r\n    ;\r\n}\r\n;\r\nclass BearerTokenMissing extends ApiError {\r\n    static generate() {\r\n        return new this();\r\n    }\r\n    ;\r\n    constructor() {\r\n        const parameters = {\r\n            code: 'bearerTokenMissing',\r\n            status: 400\r\n        };\r\n        super(parameters);\r\n    }\r\n    ;\r\n}\r\n;\r\nclass UnauthorisedError extends ApiError {\r\n    static generate() {\r\n        return new this();\r\n    }\r\n    ;\r\n    constructor() {\r\n        const parameters = {\r\n            code: 'unauthorised',\r\n            status: 403\r\n        };\r\n        super(parameters);\r\n    }\r\n    ;\r\n}\r\n;\r\nclass PluckRequired extends ApiError {\r\n    static generate() {\r\n        return new this();\r\n    }\r\n    ;\r\n    constructor() {\r\n        const parameters = {\r\n            code: 'pluckRequired',\r\n            status: 400\r\n        };\r\n        super(parameters);\r\n    }\r\n    ;\r\n}\r\n;\r\nclass PluckLong extends ApiError {\r\n    static generate() {\r\n        return new this();\r\n    }\r\n    ;\r\n    constructor() {\r\n        const parameters = {\r\n            code: 'pluckLong',\r\n            status: 400\r\n        };\r\n        super(parameters);\r\n    }\r\n    ;\r\n}\r\n;\r\nclass PluckParse extends ApiError {\r\n    static generate() {\r\n        return new this();\r\n    }\r\n    ;\r\n    constructor() {\r\n        const parameters = {\r\n            code: 'pluckParse',\r\n            status: 400\r\n        };\r\n        super(parameters);\r\n    }\r\n    ;\r\n}\r\n;\r\nclass PluckInvalid extends ApiError {\r\n    static generate(reason) {\r\n        return new this(reason);\r\n    }\r\n    ;\r\n    constructor(reason) {\r\n        const parameters = {\r\n            code: 'pluckInvalid',\r\n            message: reason,\r\n            status: 400\r\n        };\r\n        super(parameters);\r\n    }\r\n    ;\r\n}\r\n;\r\n\n\n//# sourceURL=webpack:///./src/Modules/Errors.ts?");

/***/ }),

/***/ "./src/Modules/Retrieve.ts":
/*!*********************************!*\
  !*** ./src/Modules/Retrieve.ts ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var src_Modules_Utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/Modules/Utilities */ \"./src/Modules/Utilities/index.ts\");\n/* harmony import */ var src_Modules_Errors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/Modules/Errors */ \"./src/Modules/Errors.ts\");\n\r\n\r\n\r\n/* harmony default export */ __webpack_exports__[\"default\"] = (async function ({ resourceAncestors, request, response, next }) {\r\n    const promises = resourceAncestors.map(resource => retrieveParameter({ resource, request, response }));\r\n    const results = await Promise.all(promises);\r\n    const success = results.every(result => result === true);\r\n    if (!success)\r\n        return;\r\n    next();\r\n});\r\n;\r\nasync function retrieveParameter({ resource, request, response }) {\r\n    if (!isParameter({ resource }))\r\n        return true;\r\n    let data;\r\n    try {\r\n        data = await resource.retrieve({ request, response });\r\n    }\r\n    catch (error) {\r\n        Object(src_Modules_Utilities__WEBPACK_IMPORTED_MODULE_0__[\"handleResourceError\"])({ response, error });\r\n        return;\r\n    }\r\n    ;\r\n    if (data === undefined) {\r\n        return;\r\n    }\r\n    ;\r\n    if (data === false) {\r\n        Object(src_Modules_Utilities__WEBPACK_IMPORTED_MODULE_0__[\"handleResourceError\"])({ response });\r\n        return;\r\n    }\r\n    ;\r\n    if (!data) {\r\n        Object(src_Modules_Utilities__WEBPACK_IMPORTED_MODULE_0__[\"handleResourceError\"])({ response, apiError: src_Modules_Errors__WEBPACK_IMPORTED_MODULE_1__[\"NotFound\"].generate(resource) });\r\n        return;\r\n    }\r\n    ;\r\n    augmentLocals(resource, response, data);\r\n    return true;\r\n}\r\n;\r\nfunction augmentLocals(resource, response, data) {\r\n    const resourceNameWithoutColon = resource.name.substring(1);\r\n    const resourceData = response.locals.resourceData || {};\r\n    resourceData[resourceNameWithoutColon] = data;\r\n    response.locals.resourceData = resourceData;\r\n}\r\n;\r\nfunction isParameter({ resource }) {\r\n    const is = resource.name[0] === ':' && 'retrieve' in resource;\r\n    return is;\r\n}\r\n;\r\n\n\n//# sourceURL=webpack:///./src/Modules/Retrieve.ts?");

/***/ }),

/***/ "./src/Modules/Utilities/index.ts":
/*!****************************************!*\
  !*** ./src/Modules/Utilities/index.ts ***!
  \****************************************/
/*! exports provided: handleResourceError, handleResourceSuccess, assignPropertiesFromParameters */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"handleResourceError\", function() { return handleResourceError; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"handleResourceSuccess\", function() { return handleResourceSuccess; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"assignPropertiesFromParameters\", function() { return assignPropertiesFromParameters; });\n/* harmony import */ var src_Modules_Errors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/Modules/Errors */ \"./src/Modules/Errors.ts\");\n\r\n\r\nfunction handleResourceError(parameters) {\r\n    const { response } = parameters;\r\n    if (parameters.error)\r\n        console.log(parameters.error);\r\n    if (response.headersSent)\r\n        return;\r\n    const apiError = parameters.apiError || src_Modules_Errors__WEBPACK_IMPORTED_MODULE_0__[\"UnexpectedError\"].generate();\r\n    const status = parameters.status ? parameters.status : apiError.status;\r\n    const transportableError = apiError.toTransport();\r\n    response.status(status).json(transportableError);\r\n}\r\n;\r\nfunction handleResourceSuccess({ response, json }) {\r\n    if (json) {\r\n        response.status(200).json(json);\r\n    }\r\n    else {\r\n        response.status(200);\r\n    }\r\n    ;\r\n}\r\n;\r\nfunction assignPropertiesFromParameters({ target, parameters }) {\r\n    const keys = Object.keys(parameters);\r\n    for (let key of keys) {\r\n        const value = parameters[key];\r\n        target[key] = value;\r\n    }\r\n    ;\r\n}\r\n;\r\n\n\n//# sourceURL=webpack:///./src/Modules/Utilities/index.ts?");

/***/ }),

/***/ "./src/Modules/Validate.ts":
/*!*********************************!*\
  !*** ./src/Modules/Validate.ts ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! joi */ \"joi\");\n/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var src_Modules_Utilities__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/Modules/Utilities */ \"./src/Modules/Utilities/index.ts\");\n/* harmony import */ var src_Modules_Errors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/Modules/Errors */ \"./src/Modules/Errors.ts\");\n\r\n\r\n\r\n\r\nconst JOI_VALIDATE_OPTIONS = {\r\n    presence: 'required'\r\n};\r\n/* harmony default export */ __webpack_exports__[\"default\"] = (function (schema, request, response, next) {\r\n    let body = request.body;\r\n    if (request.method === 'GET') {\r\n        if (request.query.hasOwnProperty('body')) {\r\n            try {\r\n                body = JSON.parse(request.query.body);\r\n            }\r\n            catch (error) {\r\n                Object(src_Modules_Utilities__WEBPACK_IMPORTED_MODULE_1__[\"handleResourceError\"])({ response, apiError: src_Modules_Errors__WEBPACK_IMPORTED_MODULE_2__[\"InvalidBody\"].generate(error.message), status: 400 });\r\n                return;\r\n            }\r\n            ;\r\n        }\r\n        else {\r\n            body = {};\r\n        }\r\n        ;\r\n    }\r\n    ;\r\n    if (typeof body !== 'object' || body === null) {\r\n        Object(src_Modules_Utilities__WEBPACK_IMPORTED_MODULE_1__[\"handleResourceError\"])({ response, apiError: src_Modules_Errors__WEBPACK_IMPORTED_MODULE_2__[\"InvalidBody\"].generate('Not of type object.'), status: 400 });\r\n        return;\r\n    }\r\n    ;\r\n    const validated = joi__WEBPACK_IMPORTED_MODULE_0___default.a.validate(body, schema, JOI_VALIDATE_OPTIONS);\r\n    if (validated.error) {\r\n        Object(src_Modules_Utilities__WEBPACK_IMPORTED_MODULE_1__[\"handleResourceError\"])({ response, apiError: src_Modules_Errors__WEBPACK_IMPORTED_MODULE_2__[\"InvalidBody\"].generate(validated.error.message), status: 400 });\r\n        return;\r\n    }\r\n    ;\r\n    response.locals.parameters = validated.value;\r\n    next();\r\n});\r\n;\r\n\n\n//# sourceURL=webpack:///./src/Modules/Validate.ts?");

/***/ }),

/***/ "./src/Modules/ValidateConfig.ts":
/*!***************************************!*\
  !*** ./src/Modules/ValidateConfig.ts ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! joi */ \"joi\");\n/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var ___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ */ \"./src/Modules/index.ts\");\n\r\n\r\n\r\nconst RESOURCE_METHOD_SCHEMA = {\r\n    name: joi__WEBPACK_IMPORTED_MODULE_0___default.a.valid('GET', 'POST', 'PATCH', 'DELETE').optional(),\r\n    schema: joi__WEBPACK_IMPORTED_MODULE_0___default.a.alternatives(joi__WEBPACK_IMPORTED_MODULE_0___default.a.object(), joi__WEBPACK_IMPORTED_MODULE_0___default.a.object().schema()).optional(),\r\n    pluck: joi__WEBPACK_IMPORTED_MODULE_0___default.a.object().optional(),\r\n    authenticate: joi__WEBPACK_IMPORTED_MODULE_0___default.a.alternatives(joi__WEBPACK_IMPORTED_MODULE_0___default.a.boolean(), joi__WEBPACK_IMPORTED_MODULE_0___default.a.valid('bearer', 'bearer-optional')),\r\n    handler: joi__WEBPACK_IMPORTED_MODULE_0___default.a.func().required()\r\n};\r\nconst RESOURCE_SCHEMA = {\r\n    name: joi__WEBPACK_IMPORTED_MODULE_0___default.a.string().optional(),\r\n    retrieve: joi__WEBPACK_IMPORTED_MODULE_0___default.a.func().optional(),\r\n    methods: joi__WEBPACK_IMPORTED_MODULE_0___default.a.object().pattern(/(?:GET|POST|PATCH|DELETE)/, RESOURCE_METHOD_SCHEMA).default({}),\r\n    resources: joi__WEBPACK_IMPORTED_MODULE_0___default.a.object().pattern(/.+/, joi__WEBPACK_IMPORTED_MODULE_0___default.a.lazy(() => joi__WEBPACK_IMPORTED_MODULE_0___default.a.object(RESOURCE_SCHEMA))).default({})\r\n};\r\nconst AUTHENTICATION_SCHEMA = {\r\n    callback: joi__WEBPACK_IMPORTED_MODULE_0___default.a.func().required(),\r\n    helper: joi__WEBPACK_IMPORTED_MODULE_0___default.a.valid('bearer', 'bearer-optional').optional()\r\n};\r\nconst DEBUG_DEFAULT = {\r\n    paths: false\r\n};\r\nconst DEBUG_SCHEMA = joi__WEBPACK_IMPORTED_MODULE_0___default.a.object({\r\n    paths: joi__WEBPACK_IMPORTED_MODULE_0___default.a.boolean().optional()\r\n})\r\n    .default(DEBUG_DEFAULT);\r\nconst SCHEMA = joi__WEBPACK_IMPORTED_MODULE_0___default.a.object({\r\n    port: joi__WEBPACK_IMPORTED_MODULE_0___default.a.number().required(),\r\n    resources: joi__WEBPACK_IMPORTED_MODULE_0___default.a.object().pattern(/.+/, RESOURCE_SCHEMA).default({}),\r\n    authentication: joi__WEBPACK_IMPORTED_MODULE_0___default.a.alternatives(joi__WEBPACK_IMPORTED_MODULE_0___default.a.func(), AUTHENTICATION_SCHEMA).optional(),\r\n    root: joi__WEBPACK_IMPORTED_MODULE_0___default.a.string().default('/'),\r\n    debug: DEBUG_SCHEMA\r\n});\r\n/* harmony default export */ __webpack_exports__[\"default\"] = (function (config) {\r\n    const valid = joi__WEBPACK_IMPORTED_MODULE_0___default.a.validate(config, SCHEMA);\r\n    if (valid.error)\r\n        throw new ___WEBPACK_IMPORTED_MODULE_1__[\"RestServerError\"](valid.error.message);\r\n    const validated = valid.value;\r\n    return validated;\r\n});\r\n;\r\n\n\n//# sourceURL=webpack:///./src/Modules/ValidateConfig.ts?");

/***/ }),

/***/ "./src/Modules/ValidatePluck.ts":
/*!**************************************!*\
  !*** ./src/Modules/ValidatePluck.ts ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! joi */ \"joi\");\n/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var src_Modules_Utilities__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! src/Modules/Utilities */ \"./src/Modules/Utilities/index.ts\");\n/* harmony import */ var src_Modules_Errors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/Modules/Errors */ \"./src/Modules/Errors.ts\");\n\r\n\r\n\r\n\r\n;\r\nconst SCHEMA = joi__WEBPACK_IMPORTED_MODULE_0___default.a.alternatives(joi__WEBPACK_IMPORTED_MODULE_0___default.a\r\n    .object()\r\n    .pattern(/.+/, joi__WEBPACK_IMPORTED_MODULE_0___default.a.alternatives(joi__WEBPACK_IMPORTED_MODULE_0___default.a.boolean(), joi__WEBPACK_IMPORTED_MODULE_0___default.a.lazy(() => SCHEMA))), joi__WEBPACK_IMPORTED_MODULE_0___default.a\r\n    .array()\r\n    .items(joi__WEBPACK_IMPORTED_MODULE_0___default.a.alternatives(joi__WEBPACK_IMPORTED_MODULE_0___default.a.string(), joi__WEBPACK_IMPORTED_MODULE_0___default.a.lazy(() => SCHEMA))));\r\n/* harmony default export */ __webpack_exports__[\"default\"] = (function (method, request, response, next) {\r\n    const bodyProvided = request.query.hasOwnProperty('body');\r\n    if (!bodyProvided) {\r\n        Object(src_Modules_Utilities__WEBPACK_IMPORTED_MODULE_1__[\"handleResourceError\"])({ response, apiError: src_Modules_Errors__WEBPACK_IMPORTED_MODULE_2__[\"PluckRequired\"].generate() });\r\n        return;\r\n    }\r\n    ;\r\n    let body;\r\n    try {\r\n        body = JSON.parse(request.query.body);\r\n    }\r\n    catch (error) {\r\n        Object(src_Modules_Utilities__WEBPACK_IMPORTED_MODULE_1__[\"handleResourceError\"])({ response, apiError: src_Modules_Errors__WEBPACK_IMPORTED_MODULE_2__[\"PluckParse\"].generate() });\r\n        return;\r\n    }\r\n    ;\r\n    const pluckProvided = body.hasOwnProperty('pluck');\r\n    if (method.pluck && !pluckProvided) {\r\n        Object(src_Modules_Utilities__WEBPACK_IMPORTED_MODULE_1__[\"handleResourceError\"])({ response, apiError: src_Modules_Errors__WEBPACK_IMPORTED_MODULE_2__[\"PluckRequired\"].generate() });\r\n        return;\r\n    }\r\n    ;\r\n    const validated = joi__WEBPACK_IMPORTED_MODULE_0___default.a.validate(body.pluck, SCHEMA);\r\n    if (validated.error) {\r\n        Object(src_Modules_Utilities__WEBPACK_IMPORTED_MODULE_1__[\"handleResourceError\"])({ response, apiError: src_Modules_Errors__WEBPACK_IMPORTED_MODULE_2__[\"PluckInvalid\"].generate(validated.error.message) });\r\n        return;\r\n    }\r\n    ;\r\n    const pluck = validated.value;\r\n    response.locals.pluck =\r\n        {\r\n            parsed: pluck,\r\n            rethink: pluck\r\n        };\r\n    next();\r\n});\r\n;\r\n\n\n//# sourceURL=webpack:///./src/Modules/ValidatePluck.ts?");

/***/ }),

/***/ "./src/Modules/index.ts":
/*!******************************!*\
  !*** ./src/Modules/index.ts ***!
  \******************************/
/*! exports provided: Pluck, default, RestServerError, ApiError, UnexpectedError, InvalidBody, NotFound, BearerTokenMissing, UnauthorisedError, PluckRequired, PluckLong, PluckParse, PluckInvalid, handleResourceError, handleResourceSuccess, assignPropertiesFromParameters */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Pluck\", function() { return Pluck; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return initialise; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"RestServerError\", function() { return RestServerError; });\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ \"express\");\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var body_parser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! body-parser */ \"body-parser\");\n/* harmony import */ var body_parser__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(body_parser__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! http */ \"http\");\n/* harmony import */ var http__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(http__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var cors__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! cors */ \"cors\");\n/* harmony import */ var cors__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(cors__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! joi */ \"joi\");\n/* harmony import */ var joi__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(joi__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _ValidateConfig__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ValidateConfig */ \"./src/Modules/ValidateConfig.ts\");\n/* harmony import */ var _Authenticate__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Authenticate */ \"./src/Modules/Authenticate/index.ts\");\n/* harmony import */ var _Validate__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Validate */ \"./src/Modules/Validate.ts\");\n/* harmony import */ var _ValidatePluck__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./ValidatePluck */ \"./src/Modules/ValidatePluck.ts\");\n/* harmony import */ var _Retrieve__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Retrieve */ \"./src/Modules/Retrieve.ts\");\n/* harmony import */ var _Errors__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./Errors */ \"./src/Modules/Errors.ts\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"ApiError\", function() { return _Errors__WEBPACK_IMPORTED_MODULE_10__[\"ApiError\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"UnexpectedError\", function() { return _Errors__WEBPACK_IMPORTED_MODULE_10__[\"UnexpectedError\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"InvalidBody\", function() { return _Errors__WEBPACK_IMPORTED_MODULE_10__[\"InvalidBody\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"NotFound\", function() { return _Errors__WEBPACK_IMPORTED_MODULE_10__[\"NotFound\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"BearerTokenMissing\", function() { return _Errors__WEBPACK_IMPORTED_MODULE_10__[\"BearerTokenMissing\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"UnauthorisedError\", function() { return _Errors__WEBPACK_IMPORTED_MODULE_10__[\"UnauthorisedError\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"PluckRequired\", function() { return _Errors__WEBPACK_IMPORTED_MODULE_10__[\"PluckRequired\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"PluckLong\", function() { return _Errors__WEBPACK_IMPORTED_MODULE_10__[\"PluckLong\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"PluckParse\", function() { return _Errors__WEBPACK_IMPORTED_MODULE_10__[\"PluckParse\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"PluckInvalid\", function() { return _Errors__WEBPACK_IMPORTED_MODULE_10__[\"PluckInvalid\"]; });\n\n/* harmony import */ var _Utilities__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./Utilities */ \"./src/Modules/Utilities/index.ts\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"handleResourceError\", function() { return _Utilities__WEBPACK_IMPORTED_MODULE_11__[\"handleResourceError\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"handleResourceSuccess\", function() { return _Utilities__WEBPACK_IMPORTED_MODULE_11__[\"handleResourceSuccess\"]; });\n\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"assignPropertiesFromParameters\", function() { return _Utilities__WEBPACK_IMPORTED_MODULE_11__[\"assignPropertiesFromParameters\"]; });\n\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n;\r\n;\r\n;\r\n;\r\n;\r\n;\r\n;\r\n;\r\nvar Pluck;\r\n(function (Pluck) {\r\n    ;\r\n})(Pluck || (Pluck = {}));\r\n;\r\n;\r\n;\r\n;\r\n;\r\nfunction initialise(config) {\r\n    config = Object(_ValidateConfig__WEBPACK_IMPORTED_MODULE_5__[\"default\"])(config);\r\n    const app = express__WEBPACK_IMPORTED_MODULE_0___default()();\r\n    app.locals.config = config;\r\n    initialiseExpress(app);\r\n    initialiseResources(app);\r\n    listenExpressHttp(app);\r\n}\r\n;\r\nfunction initialiseExpress(app) {\r\n    app.use(body_parser__WEBPACK_IMPORTED_MODULE_1__[\"json\"]());\r\n    app.use(cors__WEBPACK_IMPORTED_MODULE_3___default()());\r\n}\r\n;\r\nfunction initialiseResources(app) {\r\n    const router = express__WEBPACK_IMPORTED_MODULE_0___default.a.Router();\r\n    for (let resource of Object.entries(app.locals.config.resources)) {\r\n        initialiseResource({ name: resource[0], resource: resource[1], router, path: '', resourceAncestors: [] });\r\n    }\r\n    ;\r\n    app.use(app.locals.config.root, router);\r\n    listenResourceNotFound(app);\r\n}\r\n;\r\nfunction initialiseResource({ name, resource, router, path, resourceAncestors }) {\r\n    if (typeof resource.name === 'string' && resource.name !== name)\r\n        throw new ResourceNameMismatch({ name, resource });\r\n    resource.name = name;\r\n    path += '/' + resource.name;\r\n    resourceAncestors = augmentAncestors({ resource, ancestors: resourceAncestors });\r\n    logPath({ resource, path, router });\r\n    initialiseResourceMiddleware(resource, router, path, resourceAncestors);\r\n    initialiseSubresources(resource, router, path, resourceAncestors);\r\n}\r\n;\r\nclass ResourceNameMismatch extends Error {\r\n    constructor({ name, resource }) {\r\n        const message = 'Resource name \\'' + name + '\\' mismatch with resource.name \\'' + resource.name + '\\'';\r\n        super(message);\r\n    }\r\n    ;\r\n}\r\n;\r\nfunction augmentAncestors({ resource, ancestors }) {\r\n    const augmented = [];\r\n    augmented.push(...ancestors, resource);\r\n    return augmented;\r\n}\r\n;\r\nfunction logPath({ resource, path, router }) {\r\n    if (!router)\r\n        return;\r\n    const methodEntries = resource.methods && Object.entries(resource.methods);\r\n    const methodsLog = (methodEntries && methodEntries.length > 0) ? ' => ' + methodEntries.map(entry => entry[0]).join(' ') : '';\r\n    const pathLog = path + methodsLog;\r\n    console.log(pathLog);\r\n}\r\n;\r\nfunction initialiseResourceMiddleware(resource, router, path, resourceAncestors) {\r\n    const route = router.route(path);\r\n    initialiseResourceMethods(resource, route, resourceAncestors);\r\n    route.all((request, response) => handleResourceMethodUnavailable({ request, response }));\r\n}\r\n;\r\nfunction initialiseResourceMethods(resource, route, resourceAncestors) {\r\n    if (!resource.methods)\r\n        return;\r\n    for (let methodName of Object.keys(resource.methods)) {\r\n        const method = resource.methods[methodName];\r\n        initialiseResourceMethod(methodName, method, route, resourceAncestors);\r\n    }\r\n    ;\r\n}\r\n;\r\nfunction initialiseResourceMethod(name, method, route, resourceAncestors) {\r\n    if (typeof method.name === 'string' && method.name !== name)\r\n        throw new ResourceMethodMismatch({ name, method });\r\n    method.name = name;\r\n    const methodIdentifier = method.name.toLowerCase();\r\n    const methodHandler = route[methodIdentifier].bind(route);\r\n    methodHandler((request, response, next) => Object(_Authenticate__WEBPACK_IMPORTED_MODULE_6__[\"default\"])({ method, request, response, next }));\r\n    initialiseResourceMethodParameter(methodHandler, resourceAncestors);\r\n    initialiseMethodSchema(methodIdentifier, method, route);\r\n    if (method.pluck)\r\n        methodHandler(_ValidatePluck__WEBPACK_IMPORTED_MODULE_8__[\"default\"].bind(null, method));\r\n    methodHandler((request, response) => handleResourceMethod({ request, response, method }));\r\n}\r\n;\r\nclass ResourceMethodMismatch extends Error {\r\n    constructor({ name, method }) {\r\n        const message = 'Resource method name \\'' + name + '\\' mismatch with method.name \\'' + method.name + '\\'';\r\n        super(message);\r\n    }\r\n    ;\r\n}\r\n;\r\nfunction initialiseResourceMethodParameter(methodHandler, resourceAncestors) {\r\n    methodHandler((request, response, next) => Object(_Retrieve__WEBPACK_IMPORTED_MODULE_9__[\"default\"])({ resourceAncestors, request, response, next }));\r\n}\r\n;\r\nasync function handleResourceMethod({ request, response, method }) {\r\n    const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;\r\n    try {\r\n        if (method.handler instanceof AsyncFunction) {\r\n            await method.handler({ request, response });\r\n        }\r\n        else {\r\n            method.handler({ request, response });\r\n        }\r\n        ;\r\n    }\r\n    catch (error) {\r\n        Object(_Utilities__WEBPACK_IMPORTED_MODULE_11__[\"handleResourceError\"])({ error, response, apiError: _Errors__WEBPACK_IMPORTED_MODULE_10__[\"UnexpectedError\"].generate() });\r\n        return;\r\n    }\r\n    ;\r\n}\r\n;\r\nfunction initialiseMethodSchema(methodIdentifier, method, route) {\r\n    if (!method.schema) {\r\n        return;\r\n    }\r\n    ;\r\n    const baseSchema = method.schema.isJoi === true ? method.schema : joi__WEBPACK_IMPORTED_MODULE_4___default.a.object(method.schema);\r\n    const schema = baseSchema\r\n        .keys({\r\n        pluck: joi__WEBPACK_IMPORTED_MODULE_4___default.a.alternatives(joi__WEBPACK_IMPORTED_MODULE_4___default.a.object(), joi__WEBPACK_IMPORTED_MODULE_4___default.a.array())\r\n            .optional()\r\n    });\r\n    route[methodIdentifier](_Validate__WEBPACK_IMPORTED_MODULE_7__[\"default\"].bind(null, schema));\r\n}\r\n;\r\nfunction handleResourceMethodUnavailable({ response }) {\r\n    response.sendStatus(405);\r\n}\r\n;\r\nfunction initialiseSubresources(resource, router, path, resourceAncestors) {\r\n    if (!resource.resources) {\r\n        return;\r\n    }\r\n    ;\r\n    for (let subresource of Object.entries(resource.resources)) {\r\n        initialiseResource({ name: subresource[0], resource: subresource[1], router, path, resourceAncestors });\r\n    }\r\n    ;\r\n}\r\n;\r\nfunction listenResourceNotFound(app) {\r\n    app.use((request, response) => handleResourceNotFound({ request, response }));\r\n}\r\n;\r\nfunction handleResourceNotFound({ response }) {\r\n    response.status(404).json(_Errors__WEBPACK_IMPORTED_MODULE_10__[\"NotFound\"].generate('nonexistent'));\r\n}\r\n;\r\nfunction listenExpressHttp(app) {\r\n    const httpServer = new http__WEBPACK_IMPORTED_MODULE_2__[\"Server\"](app);\r\n    httpServer.listen(app.locals.config.port);\r\n    console.log('Listening on port ' + app.locals.config.port + ' at \\'' + app.locals.config.root + '\\'.');\r\n}\r\n;\r\nclass RestServerError extends Error {\r\n    constructor(message) {\r\n        super(message);\r\n    }\r\n    ;\r\n}\r\n;\r\n\n\n//# sourceURL=webpack:///./src/Modules/index.ts?");

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"body-parser\");\n\n//# sourceURL=webpack:///external_%22body-parser%22?");

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"cors\");\n\n//# sourceURL=webpack:///external_%22cors%22?");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"express\");\n\n//# sourceURL=webpack:///external_%22express%22?");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"http\");\n\n//# sourceURL=webpack:///external_%22http%22?");

/***/ }),

/***/ "joi":
/*!**********************!*\
  !*** external "joi" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"joi\");\n\n//# sourceURL=webpack:///external_%22joi%22?");

/***/ })

/******/ });
});
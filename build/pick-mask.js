/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var compile = __webpack_require__(1)
	  , filter = __webpack_require__(3)

	function mask(obj, mask) {
	  return filter(obj, compile(mask)) || null
	}

	mask.compile = compile
	mask.filter = filter

	module.exports = mask

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(2)
	  , TERMINALS = {',': 1, '/': 2, '(': 3, ')': 4}

	module.exports = compile

	/**
	 *  Compiler
	 *
	 *  Grammar:
	 *     Props ::= Prop | Prop "," Props
	 *      Prop ::= Object | Array
	 *    Object ::= NAME | NAME "/" Object
	 *     Array ::= NAME "(" Props ")"
	 *      NAME ::= ? all visible characters ?
	 *
	 *  Examples:
	 *    a
	 *    a,d,g
	 *    a/b/c
	 *    a(b)
	 *    ob,a(k,z(f,g/d)),d
	 */

	function compile(text) {
	  if (!text) return null
	  return parse(scan(text))
	}

	function scan(text) {
	  var i = 0
	    , len = text.length
	    , tokens = []
	    , name = ''
	    , ch

	  function maybePushName() {
	    if (!name) return
	    tokens.push({tag: '_n', value: name})
	    name = ''
	  }

	  for (; i < len; i++) {
	    ch = text.charAt(i)
	    if (TERMINALS[ch]) {
	      maybePushName()
	      tokens.push({tag: ch})
	    } else {
	      name += ch
	    }
	  }
	  maybePushName()

	  return tokens
	}

	function parse(tokens) {
	  return _buildTree(tokens, {}, [])
	}

	function _buildTree(tokens, parent, stack) {
	  var props = {}
	    , openTag
	    , token
	    , peek

	  while (token = tokens.shift()) {
	    if ('_n' === token.tag) {
	      token.type = 'object'
	      token.properties = _buildTree(tokens, token, stack)
	      // exit if in object stack
	      peek = stack[stack.length-1]
	      if (peek && ('/' == peek.tag)) {
	        stack.pop()
	        _addToken(token, props)
	        return props
	      }
	    } else if (',' === token.tag) {
	      return props
	    } else if ('(' === token.tag) {
	      stack.push(token)
	      parent.type = 'array'
	      continue
	    } else if (')' === token.tag) {
	      openTag = stack.pop(token)
	      return props
	    } else if ('/' === token.tag) {
	      stack.push(token)
	      continue
	    }
	    _addToken(token, props)
	  }

	  return props
	}

	function _keyObj(key){
	    var rtn = { };
	    key = key.split('|');
	    if(key[1]){
	      var sub = key[1].split('-');
	      rtn.begin = sub[1] ? sub[0] : 0;
	      rtn.end = +(sub[1] || sub[0])
	    }
	    key = key[0].split('@');
	    rtn.name = key[1] || key[0];
	    rtn.key = key[0];
	    return rtn;
	}

	function _addToken(token, props) {
	  var obj = _keyObj(token.value);
	  obj.type = token.type;

	  props[obj.key] = obj;

	  if (!util.isEmpty(token.properties)) {
	    props[obj.key].properties = token.properties
	  }
	}






/***/ },
/* 2 */
/***/ function(module, exports) {

	var ObjProto = Object.prototype

	exports.isEmpty = isEmpty
	exports.isArray = Array.isArray || isArray
	exports.has = has

	function isEmpty(obj) {
	  if (obj == null) return true
	  if (isArray(obj) ||
	     ('string' === typeof obj)) return (0 === obj.length)
	  for (var key in obj) if (has(obj, key)) return false
	  return true
	}

	function isArray(obj) {
	  return ObjProto.toString.call(obj) == '[object Array]'
	}

	function has(obj, key) {
	  return ObjProto.hasOwnProperty.call(obj, key)
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(2)

	module.exports = filter

	function filter(obj, compiledMask) {
	  return util.isArray(obj) ?
	    _arrayProperties(obj, compiledMask) :
	    _properties(obj, compiledMask)
	}

	// wrap array & mask in a temp object;
	// extract results from temp at the end
	function _arrayProperties(arr, mask) {
	  var obj = _properties({_: arr}, {_: {
	      type: 'array'
	    , properties: mask
	  }})
	  return obj && obj._
	}

	function _properties(obj, mask) {
	  var maskedObj = {}, key, value, ret, retKey, typeFunc
	  if (!obj || !mask) return obj
	  for (key in mask) {
	    if (!util.has(mask, key)) continue
	    value = mask[key]
	    ret = undefined
	    typeFunc = ('object' === value.type) ? _object : _array
	    if ('*' === key) {
	      ret = _forAll(obj, value.properties, typeFunc)
	      for (retKey in ret) {
	        if (!util.has(ret, retKey)) continue
	        maskedObj[retKey] = ret[retKey]
	      }
	    } else {
	      ret = typeFunc(obj, key, value.properties, value)
	      if ('undefined' !== typeof ret) maskedObj[value.name] = ret
	    }
	  }
	  return !util.isEmpty(maskedObj) ? maskedObj : undefined
	}

	function _forAll(obj, mask, fn) {
	  var ret = {}, key, value
	  for (key in obj) {
	    if (!util.has(obj, key)) continue
	    value = fn(obj, key, mask)
	    if ('undefined' !== typeof value) ret[key] = value
	  }
	  return ret
	}

	function _object(obj, key, mask, parent) {
	  var value = obj[key]
	  if (util.isArray(value)) return _array(obj, key, mask, parent)
	  return mask ? _properties(value, mask) : value
	}

	function _array(object, key, mask, parent) {
	  var ret = [], arr = object[key]
	    , i, l, obj, maskedObj
	  if (!util.isArray(arr)) return _properties(arr, mask)
	  if (util.isEmpty(arr)) return arr

	  i = parent && parent.begin || 0;
	  l = parent && parent.end || arr.length;

	  for (; i < l; i++) {
	    obj = arr[i]
	    maskedObj = _properties(obj, mask)
	    if (maskedObj) ret.push(maskedObj)
	  }
	  return ret.length ? ret : undefined
	}



/***/ }
/******/ ]);
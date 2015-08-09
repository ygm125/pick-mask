var util = require('./util')

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
    if ('*' === key || '/' === key[0]) {
      var _for = '*' === key ? _forAll : _forRegExp;
      ret = _for(obj, value.properties, typeFunc, key)
      for (retKey in ret) {
        if (!util.has(ret, retKey)) continue
        maskedObj[retKey] = ret[retKey]
      }
    }else {
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

function _forRegExp(obj, mask, fn, reg) {
  reg = reg.split('/');
  var ret = {}, key, value,patt = new RegExp(reg[1],reg[2]);
  for (key in obj) {
    if (!util.has(obj, key)) continue
    if(!patt.test(key)) continue
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
  l < 0 && (l = arr.length + l);

  for (; i < l; i++) {
    obj = arr[i]
    maskedObj = _properties(obj, mask)
    if (maskedObj) ret.push(maskedObj)
  }
  return ret.length ? ret : undefined
}


var util = require('./util')
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





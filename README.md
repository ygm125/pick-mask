# Pick Mask  [![npm version](https://img.shields.io/npm/v/pick-mask.svg)](https://www.npmjs.com/package/pick-mask)

js对象提取器，扩展自 [json-mask](https://github.com/nemtsov/json-mask) 在此感谢！

## Install

npm install pick-mask

## Syntax

- ` a,b,c` comma-separated list will select multiple fields
- ` a.b.c` path will select a field from its parent
- ` a(b,c)` sub-selection will select many fields from a parent
- ` a.*.c` the star `*` wildcard will select all items in a field

## Increase Syntax

- ` a@aa,b` rename fields
- ` a|2-5` array interception
- `	/\\w+/` regular match

## Example

```js
var pick = require('pick-mask')
pick({p: {a: 1, b: 2, aa: 11, bb: 22},z: 1}, 'p./^\\w$/,z')  // {p: {a: 1, b : 2}, z: 1}
```

more examples [test](/test/index.js)

License
-------

MIT
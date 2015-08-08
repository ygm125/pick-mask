# Pick Mask
-------
js对象提取器，扩展自 [json-mask](https://github.com/nemtsov/json-mask) 感谢！

## Install
-------
npm install pick-mask

## Syntax
-------
The syntax is loosely based on XPath:

- ` a,b,c` comma-separated list will select multiple fields
- ` a/b/c` path will select a field from its parent
- `a(b,c)` sub-selection will select many fields from a parent
- ` a/*/c` the star `*` wildcard will select all items in a field

## 增强 Syntax
-------
- ` a@aa,b` 重命名字段
- ` a|2-5` 数组截取
- `	#\\d` 正则匹配

## Example
-------
```js
var mask = require('pick-mask')
mask({p: {a: 1, b: 2}, z: 1}, 'p/a,z')  // {p: {a: 1}, z: 1}
```

更多例子查看 test

License
-------

MIT
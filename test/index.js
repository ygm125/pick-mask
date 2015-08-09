var pickMask = require('../lib');

var obj = {
	a : 1,
	b : 2,
	c : {
		a : 3,
		b : 4,
		c : 5
	},
	d : [
		{
			a : 5
		},
		{
			b : 6
		},
		{
			c : 7
		}	
	],
	ff : {
		age : 18
	},
	dd : {
		name : 'gm'
	}
}

console.log(pickMask(obj,'a'));

console.log(pickMask(obj,'a,c'));

console.log(pickMask(obj,'c.a'));

console.log(pickMask(obj,'c@cc.(a,b)'));

console.log(pickMask(obj,'c.*'));

console.log(pickMask(obj,'#^\\w$'));




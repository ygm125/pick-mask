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

console.log(pickMask(obj,'a')); // { a: 1 }

console.log(pickMask(obj,'a,c')); // { a: 1 , c: { a: 3 , b: 4 , c: 5 } }

console.log(pickMask(obj,'c.a')); // { c: { a: 3 } }

console.log(pickMask(obj,'c@cc.(a,b)')); // { cc: { a: 3, b: 4 } }

console.log(pickMask(obj,'c.*')); //{ c: { a: 3, b: 4, c: 5 } }

console.log(pickMask(obj,'/^\\w{2}$/')); //{ ff: { age: 18} , dd:{ name: 'gm'} }




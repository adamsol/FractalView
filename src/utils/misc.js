
let Keys = {ENTER: 13, SHIFT: 16, CTRL: 17, ALT: 18};
for (let c = 65; c <= 90; ++c) {
	Keys[String.fromCharCode(c)] = c;
}

Array.prototype.extend = function(arr)
{
	arr.forEach(function(el) {
		this.push(el);
	}.bind(this));
};

Array.prototype.remove = function(el)
{
	let index = this.indexOf(el);
	this.splice(index, 1);
};

Array.prototype.prop = function(prop)
{
	return this.map(function(obj) {
		return obj[prop];
	});
};

String.prototype.upper = String.prototype.toUpperCase;
String.prototype.lower = String.prototype.toLowerCase;

String.prototype.capitalize = function()
{
	return this[0].upper() + this.slice(1);
};

String.prototype.format = function()
{
	let args = arguments;
	return this.replace(/{([\w.]*)}/g, function(match, pattern) {
		let attrs = pattern.split('.');
		attrs[0] = attrs[0] || '0';
		let obj = args;
		if (typeof obj[0] == 'object')
			obj = obj[0];
		for (let i = 0, n = attrs.length; i < n; ++i) {
			obj = obj[attrs[i]];
			if (obj === undefined)
				break;
		}
		return (obj !== undefined ? obj : match);
	});
};

let _ = undefined;

Function.prototype.curry = function()
{
	let f = this;
	let org_args = [].slice.call(arguments);
	return function() {
		let args = org_args.slice();
		let new_args = [].slice.call(arguments);
		let i, j;
		for (i = 0, j = 0; i < args.length && j < new_args.length; ++i) {
			if (args[i] === _) {
				args[i] = new_args[j++];
			}
		}
		return f.apply(this, args.concat(new_args.slice(j)));
	};
};

Function.prototype.lock = function(n)
{
	let f = this;
	return function() {
		return f.apply(this, [].slice.call(arguments, 0, n));
	};
};

// Beware: they are mutable!
THREE.Vector3.Zero = new THREE.Vector3(0, 0, 0);
THREE.Vector3.X = new THREE.Vector3(1, 0, 0);
THREE.Vector3.Y = new THREE.Vector3(0, 1, 0);
THREE.Vector3.Z = new THREE.Vector3(0, 0, 1);

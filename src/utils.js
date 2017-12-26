
Array.prototype.extend = function(arr)
{
	arr.forEach(function(el) {
		this.push(el);
	}.bind(this));
};

Array.prototype.remove = function(el)
{
	var index = this.indexOf(el);
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
	var args = arguments;
	return this.replace(/{([\w.]*)}/g, function(match, pattern) {
		var attrs = pattern.split('.');
		attrs[0] = attrs[0] || '0';
		var obj = args;
		for (var i = 0, n = attrs.length; i < n; ++i) {
			obj = obj[attrs[i]];
			if (obj === undefined) {
				break;
			}
		}
		return (obj !== undefined ? obj : match);
	});
};

var _ = undefined;

Function.prototype.curry = function()
{
	var f = this;
	var org_args = [].slice.call(arguments);
	return function() {
		var args = org_args.slice();
		var new_args = [].slice.call(arguments);
		var i, j;
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
	var f = this;
	return function() {
		return f.apply(this, [].slice.call(arguments, 0, n));
	};
};
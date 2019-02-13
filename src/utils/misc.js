
let Keys = {ENTER: 13, SHIFT: 16, CTRL: 17, ALT: 18};
for (let c = 65; c <= 90; ++c) {
	Keys[String.fromCharCode(c)] = c;
}

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

// Beware: they are mutable!
THREE.Vector3.Zero = new THREE.Vector3(0, 0, 0);
THREE.Vector3.X = new THREE.Vector3(1, 0, 0);
THREE.Vector3.Y = new THREE.Vector3(0, 1, 0);
THREE.Vector3.Z = new THREE.Vector3(0, 0, 1);

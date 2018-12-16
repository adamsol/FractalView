
function InspectorView(container, state)
{
	let self = this;
	self.container = container.getElement().empty();

	let fractal_select = $('<select>', {'class': 'fractal'}).appendTo(self.container);
	for (let name of fs.readdirSync('src/renderers/fractal')) {
		$('<option>', {value: name, text: path.basename(name, '.glsl')}).appendTo(fractal_select);
	};
	fractal_select.on('change', {self: self}, self.onChange);

	let lighting_select = $('<select>', {'class': 'lighting'}).appendTo(self.container);
	for (let name of fs.readdirSync('src/renderers/lighting')) {
		$('<option>', {value: name, text: path.basename(name, '.glsl')}).appendTo(lighting_select);
	};
	lighting_select.on('change', {self: self}, self.onChange);

	self.update();
}

InspectorView.prototype.onChange = function(event)
{
	let self = event.data.self;
	self.update();
};

InspectorView.prototype.update = function()
{
	let self = this;
	let fractal = self.container.find('.fractal').val();
	let lighting = self.container.find('.lighting').val();
	if (!fractal || !lighting) {
		return;
	}
	let promises = [
		$.get('renderers/base.vert'),
		$.get('renderers/base.frag'),
		$.get('renderers/fractal/{}'.format(fractal)),
		$.get('renderers/lighting/{}'.format(lighting)),
	];
	$.when(...promises).done(function(vertex, fragment, fractal, lighting) {
		if (mesh) {
			scene.remove(mesh);
		}
		mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2.0, 2.0), null);
		mesh.material = new THREE.RawShaderMaterial({
			uniforms: {
				CX: {value: 2.0},
				screenRes: {},
				cameraPos: {},
				cameraDir: {},
			},
			vertexShader: vertex[0],
			fragmentShader: fragment[0].format({fractal: fractal[0], lighting: lighting[0]}),
		});
		scene.add(mesh);
	});
};

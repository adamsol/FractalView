
function InspectorView(container, state)
{
	this.container = container.getElement().empty();

	let select = $('<select>', {id: 'fractal'}).appendTo(this.container).append($('<option>', {text: '-- select --'}));
	fs.readdir('src/renderers/fractal', (err, files) => {
		for (let name of files) {
			$('<option>', {value: name, text: name}).appendTo(select);
		}
	});
	select.on('change', function() {
		let vertex = $.get('renderers/base.vert');
		let fragment = $.get('renderers/base.frag');
		let lighting = $.get('renderers/lighting/lambert.frag');
		let fractal = $.get('renderers/fractal/{}'.format($(this).val()));
		$.when(vertex, fragment, lighting, fractal).done(function(vertex, fragment, lighting, fractal) {
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
				fragmentShader: fragment[0].format({lighting: lighting[0], fractal: fractal[0]}),
			});
			scene.add(mesh);
		});
	});
}

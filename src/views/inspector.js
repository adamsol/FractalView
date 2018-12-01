
function InspectorView(container, state)
{
	this.container = container.getElement().empty();

	var select = $('<select>', {id: 'fractal'}).appendTo(this.container).append($('<option>', {text: '-- select --'}));
	fractals.forEach(function(name) {
		$('<option>', {value: name, text: name}).appendTo(select);
	});
	select.on('change', function() {
		$.get('fractals/{}.glsl'.format($(this).val()), function(glsl) {
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
				vertexShader: $('#shader_vert').text(),
				fragmentShader: $('#shader_frag').text().format({code: glsl}),
			});
			scene.add(mesh);
		});
	});

	var self = this;
	this.container.on('input change keydown', '.component-value input, .component-value select', function(event) {
		if (event.type != 'keydown' || event.which == 13) {
			self.updateValue($(this));
		}
	});
}

InspectorView.prototype.updateValue = function(input) {
	var attrs = input.attr('data-name').split('.');
	obj = this.actor.components[input.closest('.component').data('index')];
	for (var i = 0; i < attrs.length - 1; ++i) {
		obj = obj[attrs[i]];
	}
	var attr = attrs.pop();
	var value = input.val() || input.data('default');
	obj[attr] = value;
};


var scene, camera, geometry, material, layout;

$(function()
{
	scene = new THREE.Scene();
	camera = new THREE.Camera();
	geometry = new THREE.PlaneBufferGeometry(2.0, 2.0);
	material = new THREE.RawShaderMaterial({
		uniforms: {
			screenRes: {},
			cameraPos: {},
			cameraDir: {},
		},
		vertexShader: $('#vertex_shader').text(),
		fragmentShader: $('#fragment_shader').text(),
	});
	scene.add(new THREE.Mesh(geometry, material));

	var config = {
		content: [{
			type: 'row',
			content: [{
				type: 'component',
				title: 'Scene',
				componentName: 'scene',
				componentState: {},
			}]
		}]
	};

	layout = new GoldenLayout(config);

	layout.registerComponent('scene', SceneView);

	layout.init();
});

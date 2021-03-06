
function SceneView(container, state)
{
	this.canvas = container.getElement().empty();
	this.canvas.attr('tabindex', 42).css('outline', 'none');

	this.renderer = new THREE.WebGLRenderer({antialias: true});
	this.canvas.append(this.renderer.domElement);

	this.stats = new Stats();
	this.stats.dom.style.position = 'absolute';
	this.canvas.append(this.stats.dom);

	this.shader = null;
	this.params = null;
	this.frame = {};

	this.frame.scene = new THREE.Scene();
	this.frame.mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2.0, 2.0), null);
	this.frame.scene.add(this.frame.mesh);

	this.frame.buffer1 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, type: THREE.FloatType});
	this.frame.buffer2 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, type: THREE.FloatType});
	this.frame.material = new THREE.MeshBasicMaterial({map: this.frame.buffer2});
	this.frame.camera = new THREE.Camera();
	this.frame.count = 0;

	this.camera = new THREE.PerspectiveCamera(75, 1, 0.01, 1000);
	this.controls = new CameraControls(this.camera, this.canvas);
	this.resetCamera();

	this.clock = new THREE.Clock();

	this.animate();

	this.canvas.on('keydown', this.onKeyDown.bind(this));
	container.on('resize', this.onResize.bind(this));
	container.on('destroy', this.onDestroy.bind(this));
}

SceneView.prototype.resetCamera = function()
{
	this.camera.position.set(0.0, 0.0, 3.0);
	this.camera.rotation.set(0.0, 0.0, 0.0);
	this.controls.reset();
};

SceneView.prototype.refreshCamera = function()
{
	this.camera.position.copy(scene.camera.position);
	this.camera.rotation.copy(scene.camera.rotation);
	this.controls.copy(scene.camera);
};

SceneView.prototype.initShader = function(vertex, fragment, params)
{
	this.shader = new THREE.RawShaderMaterial({
		vertexShader: vertex,
		fragmentShader: fragment,
		uniforms: $.extend({
			screenRes: {},
			randSeed: {},
			cameraPos: {value: new THREE.Vector3()},
			cameraDir: {value: new THREE.Vector3()},
			cameraRight: {value: new THREE.Vector3()},
			cameraSpeed: {},
			frameBuffer: {value: this.frame.buffer1},
			framesCount: {},
		}, params),
	});
	this.params = params;
	this.updateShader();
};

SceneView.prototype.updateShader = function()
{
	this.frame.count = 0;

	if (this.params) {
		for (let [name, param] of Object.entries(this.params)) {
			this.shader.uniforms[name].value = param.value;
		}
	}
};

SceneView.prototype.animate = function()
{
	this.stats.begin();

	if (this.shader && this.renderer) {

		let dt = this.clock.getDelta();
		this.controls.update(dt);

		scene.camera = {
			position: this.camera.position,
			rotation: this.camera.rotation,
			speed: this.controls.speed,
		};

		// When the camera is not moving, consecutive frames will be accumulated and blended together.
		if (this.controls.unlocked) {
			this.frame.count = 0;
		}

		this.shader.uniforms.screenRes.value = new THREE.Vector2(this.canvas.width(), this.canvas.height());
		this.shader.uniforms.randSeed.value = new THREE.Vector2(THREE.Math.randFloat(0.0, 1.0), THREE.Math.randFloat(0.0, 1.0));

		let cameraPos = this.shader.uniforms.cameraPos.value;
		let cameraDir = this.shader.uniforms.cameraDir.value;
		let cameraRight = this.shader.uniforms.cameraRight.value;
		this.camera.getWorldPosition(cameraPos);
		this.camera.getWorldDirection(cameraDir);
		cameraRight.copy(cameraDir).cross(THREE.Vector3.Y).normalize();
		this.shader.uniforms.cameraSpeed.value = this.controls.speed;

		this.shader.uniforms.framesCount.value = this.frame.count;
		this.frame.count += 1;

		// Render scene to buffer2.
		this.frame.mesh.material = this.shader;
		this.renderer.setRenderTarget(this.frame.buffer2);
		this.renderer.render(this.frame.scene, this.frame.camera);

		// Render buffer2 to buffer1.
		this.frame.mesh.material = this.frame.material;
		this.renderer.setRenderTarget(this.frame.buffer1);
		this.renderer.render(this.frame.scene, this.frame.camera);

		// Render to the screen.
		this.frame.mesh.material = this.frame.material;
		this.renderer.setRenderTarget(null);
		this.renderer.render(this.frame.scene, this.frame.camera);
	}

	this.stats.end();

	requestAnimationFrame(this.animate.bind(this));
};

SceneView.prototype.getImage = function()
{
	// Screenshot has to be taken immediately after the scene is rendered, otherwise it will be black.
	// https://stackoverflow.com/questions/30628064/how-to-toggle-preservedrawingbuffer-in-three-js
	this.animate();
	let url = this.renderer.domElement.toDataURL('image/jpeg');
	return url.replace(/^data:image\/jpeg;base64,/, "");
};

SceneView.prototype.onKeyDown = function()
{
	if (this.controls.unlocked && event.keyCode == Keys.R) {
		this.resetCamera();
	}
};

SceneView.prototype.onResize = function()
{
	let width = this.canvas.width(), height = this.canvas.height();

	this.camera.aspect = width / height;
	this.camera.updateProjectionMatrix();

	this.frame.buffer1.setSize(width, height);
	this.frame.buffer2.setSize(width, height);
	this.frame.count = 0;

	this.renderer.setSize(width, height);
};

SceneView.prototype.onDestroy = function()
{
	this.renderer = null;
};


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
	this.frame = {};

	this.frame.scene = new THREE.Scene();
	this.frame.mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2.0, 2.0), null);
	this.frame.scene.add(this.frame.mesh);

	this.frame.buffer1 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
	this.frame.buffer2 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
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
	this.controls.tilt = 0.0;
};

SceneView.prototype.initShader = function(vertex, fragment)
{
	this.shader = new THREE.RawShaderMaterial({
		vertexShader: vertex,
		fragmentShader: fragment,
		uniforms: {
			screenRes: {},
			randSeed: {},
			cameraPos: {value: new THREE.Vector3()},
			cameraDir: {value: new THREE.Vector3()},
			cameraRight: {value: new THREE.Vector3()},
			cameraZoom: {},
			frameBuffer: {value: this.frame.buffer1},
			framesCount: {},
		},
	});
	this.frame.count = 0;
};

SceneView.prototype.animate = function()
{
	this.stats.begin();

	if (this.shader && this.renderer) {

		let dt = this.clock.getDelta();
		this.controls.update(dt);

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
		cameraRight.copy(cameraDir).cross(THREE.Vector3.Y).applyAxisAngle(cameraDir, this.controls.tilt).normalize();
		this.shader.uniforms.cameraZoom.value = this.controls.zoom;

		this.shader.uniforms.framesCount.value = this.frame.count;
		this.frame.count += 1;

		// Render scene to buffer2.
		this.frame.mesh.material = this.shader;
		this.renderer.render(this.frame.scene, this.frame.camera, this.frame.buffer2);

		// Render buffer2 to buffer1.
		this.frame.mesh.material = this.frame.material;
		this.renderer.render(this.frame.scene, this.frame.camera, this.frame.buffer1);

		// Render to the screen.
		this.frame.mesh.material = this.frame.material;
		this.renderer.render(this.frame.scene, this.frame.camera);
	}

	this.stats.end();

	requestAnimationFrame(this.animate.bind(this));
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

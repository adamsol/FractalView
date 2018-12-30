
function CameraControls(camera, container)
{
	this.camera = camera;
	this.speed = {
		rotation: 0.003, // radians/pixel
		movement: 5, // units/second
	};
	this.unlocked = false;
	this.keys = {};

	container.on('mousedown', this.onMouseDown.bind(this));
	$(window).on('mouseup', this.onMouseUp.bind(this));
	$(window).on('mousemove', this.onMouseMove.bind(this));
	container.on('mousewheel', this.onMouseWheel.bind(this));
	container.on('keydown', this.onKeyDown.bind(this));
	container.on('keyup', this.onKeyUp.bind(this));
}

CameraControls.prototype.update = function(dt)
{
	if (this.unlocked) {
		let dist = this.speed.movement * dt;
		let axis = new THREE.Vector3();

		if (this.keys[Keys.W]) {
			axis.z -= 1;
		}
		if (this.keys[Keys.S]) {
			axis.z += 1;
		}
		if (this.keys[Keys.A]) {
			axis.x -= 1;
		}
		if (this.keys[Keys.D]) {
			axis.x += 1;
		}
		if (this.keys[Keys.Q]) {
			axis.y -= 1;
		}
		if (this.keys[Keys.E]) {
			axis.y += 1;
		}
		this.camera.translateOnAxis(axis.normalize(), dist);
	}
};

CameraControls.prototype.onMouseDown = function(event)
{
	this.unlocked = true;
};

CameraControls.prototype.onMouseMove = function(event)
{
	if (this.unlocked && this.prev_pos) {
		let dh = event.clientX - this.prev_pos.x;
		let dv = event.clientY - this.prev_pos.y;
		this.camera.rotation.y -= this.speed.rotation * dh;
		this.camera.rotation.x -= this.speed.rotation * dv;
	}
	this.prev_pos = {x: event.clientX, y: event.clientY};
};

CameraControls.prototype.onMouseUp = function(event)
{
	this.unlocked = false;
};

CameraControls.prototype.onMouseWheel = function(event)
{
	let delta = event.originalEvent.deltaY;
	if (delta < 0) {
		this.speed.movement *= 0.8;
	} else if (delta > 0) {
		this.speed.movement /= 0.8;
	}
};

CameraControls.prototype.onKeyDown = function(event)
{
	this.keys[event.keyCode] = true;
};

CameraControls.prototype.onKeyUp = function(event)
{
	this.keys[event.keyCode] = false;
};

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
	this.camera.rotation.order = 'YXZ';
	this.camera.position.set(0.0, 0.0, 3.0);

	this.controls = new CameraControls(this.camera, this.canvas);

	this.clock = new THREE.Clock();

	this.animate();

	container.on('resize', this.onResize.bind(this));
	container.on('destroy', this.onDestroy.bind(this));
}

SceneView.prototype.initShader = function(vertex, fragment)
{
	this.shader = new THREE.RawShaderMaterial({
		vertexShader: vertex,
		fragmentShader: fragment,
		uniforms: {
			CX: {value: 2.0},
			screenRes: {},
			cameraPos: {},
			cameraDir: {},
			randSeed: {},
			framesCount: {value: 0},
			frameBuffer: {value: this.frame.buffer1},
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
		this.shader.uniforms.cameraPos.value = this.camera.getWorldPosition();
		this.shader.uniforms.cameraDir.value = this.camera.getWorldDirection();
		this.shader.uniforms.randSeed.value = new THREE.Vector2(THREE.Math.randFloat(0.0, 1.0), THREE.Math.randFloat(0.0, 1.0));
		this.shader.uniforms.frameBuffer.value = this.frame.buffer1;
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

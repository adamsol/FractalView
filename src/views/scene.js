
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
	container.on('keydown', this.onKeyDown.bind(this));
	container.on('keyup', this.onKeyUp.bind(this));
}

CameraControls.prototype.update = function(dt)
{
	if (this.unlocked) {
		var dist = this.speed.movement * dt;
		if (this.keys[-18]) { // Alt
			dist *= 0.01;
		}
		if (this.keys[-17]) { // Ctrl
			dist *= 0.1;
		}
		if (this.keys[-16]) { // Shift
			dist *= 5;
		}
		var axis = new THREE.Vector3();

		if (this.keys[87]) { // W
			axis.z -= 1;
		}
		if (this.keys[83]) { // S
			axis.z += 1;
		}
		if (this.keys[65]) { // A
			axis.x -= 1;
		}
		if (this.keys[68]) { // D
			axis.x += 1;
		}
		if (this.keys[81]) { // Q
			axis.y -= 1;
		}
		if (this.keys[69]) { // E
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
		var dh = event.clientX - this.prev_pos.x;
		var dv = event.clientY - this.prev_pos.y;
		this.camera.rotation.y -= this.speed.rotation * dh;
		this.camera.rotation.x -= this.speed.rotation * dv;
	}
	this.prev_pos = {x: event.clientX, y: event.clientY};
};

CameraControls.prototype.onMouseUp = function(event)
{
	this.unlocked = false;
};

CameraControls.prototype.onKeyDown = function(event)
{
	if (event.keyCode >= 16 && event.keyCode <= 18) { // Shift / Ctrl / Alt - toggle
		this.keys[-event.keyCode] = !this.keys[-event.keyCode];
	}
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
	this.renderer.shadowMap.enabled = true;
	this.canvas.append(this.renderer.domElement);

	this.camera = new THREE.PerspectiveCamera(75, 1, 0.01, 1000);
	this.camera.rotation.order = 'YXZ';
	this.camera.position.set(0.0, 0.0, 3.0);

	this.controls = new CameraControls(this.camera, this.canvas);

	this.clock = new THREE.Clock();

	this.animate();

	container.on('resize', this.onResize.bind(this));
	container.on('destroy', this.onDestroy.bind(this));
}

SceneView.prototype.animate = function()
{
	if (!this.renderer) return;

	var dt = this.clock.getDelta();

	this.controls.update(dt);

	material.uniforms.screenRes.value = new THREE.Vector2(this.canvas.width(), this.canvas.height());
	material.uniforms.cameraPos.value = this.camera.getWorldPosition();
	material.uniforms.cameraDir.value = this.camera.getWorldDirection();

	this.renderer.render(scene, camera);

	requestAnimationFrame(this.animate.bind(this));
};

SceneView.prototype.onResize = function()
{
	var width = this.canvas.width(), height = this.canvas.height();

	this.camera.aspect = width / height;
	this.camera.updateProjectionMatrix();

	this.renderer.setSize(width, height);
};

SceneView.prototype.onDestroy = function()
{
	this.renderer = null;
};

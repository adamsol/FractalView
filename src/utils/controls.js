
function CameraControls(camera, container)
{
	this.SPEED = {
		movement: 5.0,  // units/second
		rotation: 0.003,  // radians/pixel
		tilt: 1.0,  // radians/second
		zoom: 1.0,
	};
	this.DEFAULTS = {
		speed: 1.0,
		tilt: 0.0,
		zoom: 1.5,
	};

	this.camera = camera;
	this.reset();

	container.on('mousedown', this.onMouseDown.bind(this));
	$(window).on('mouseup', this.onMouseUp.bind(this));
	$(window).on('mousemove', this.onMouseMove.bind(this));
	container.on('mousewheel', this.onMouseWheel.bind(this));
	container.on('keydown', this.onKeyDown.bind(this));
	container.on('keyup', this.onKeyUp.bind(this));
}

CameraControls.prototype.reset = function()
{
	for (let [name, value] of Object.entries(this.DEFAULTS)) {
		this[name] = value;
	}
	this.unlocked = false;
	this.keys = {};
};

CameraControls.prototype.copy = function(data)
{
	for (let [name, value] of Object.entries(this.DEFAULTS)) {
		if (data[name] !== undefined) {
			value = data[name];
		}
		this[name] = value;
	}
};

CameraControls.prototype.update = function(dt)
{
	if (this.unlocked) {
		let dist = this.SPEED.movement * this.speed * dt;
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

		if (this.keys[Keys.Z]) {
			this.tilt -= this.SPEED.tilt * dt;
		}
		if (this.keys[Keys.C]) {
			this.tilt += this.SPEED.tilt * dt;
		}
		this.camera.rotation.z = -this.tilt;

		if (this.keys[Keys.F]) {
			this.zoom *= 1.0 + this.SPEED.zoom * dt;
		}
		if (this.keys[Keys.V]) {
			this.zoom /= 1.0 + this.SPEED.zoom * dt;
		}
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
		this.camera.rotation.y -= this.SPEED.rotation * dh;
		this.camera.rotation.x -= this.SPEED.rotation * dv;
		this.camera.rotation.x = THREE.Math.clamp(this.camera.rotation.x, -1.5, 1.5);
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
		this.speed *= 0.8;
	} else if (delta > 0) {
		this.speed /= 0.8;
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


function InspectorView(container, state)
{
	this.container = container.getElement().empty();
	this.container.addClass('inspector');

	this.panel = {
		selectors: $('<div class="panel"></div>').appendTo(this.container),
		params: $('<div class="panel"></div>').appendTo(this.container),
	};

	this.fractal_select = $('<select>', {'class': 'fractal'}).appendTo(this.panel.selectors);
	for (let name of fs.readdirSync('src/renderers/fractal')) {
		$('<option>', {value: name, text: path.basename(name, '.glsl')}).appendTo(this.fractal_select);
	}
	this.fractal_select.on('change', this.onChange.bind(this));

	this.lighting_select = $('<select>', {'class': 'lighting'}).appendTo(this.panel.selectors);
	for (let name of fs.readdirSync('src/renderers/lighting')) {
		$('<option>', {value: name, text: path.basename(name, '.glsl')}).appendTo(this.lighting_select);
	}
	this.lighting_select.on('change', this.onChange.bind(this));

	$('<div class="panel"></div>').appendTo(this.panel.params);
	this.params = null;

	this.onChange();
}

InspectorView.prototype.refresh = function()
{
	this.fractal_select.val(scene.params.fractal);
	this.updateParams();
};

InspectorView.prototype.onChange = function(event)
{
	let fractal = this.fractal_select.val();
	let lighting = this.lighting_select.val();
	if (!fractal || !lighting) {
		return;
	}

	if (!event || $(event.target).hasClass('fractal')) {
		scene.params = {};
	}
	scene.params.fractal = fractal;

	this.updateParams();
};

InspectorView.prototype.updateParams = function(reset)
{
	let fractal = this.fractal_select.val();
	let lighting = this.lighting_select.val();
	let promises = [
		$.get('renderers/base.vert'),
		$.get('renderers/base.frag'),
		$.get('renderers/fractal/{}'.format(fractal)),
		$.get('renderers/lighting/{}'.format(lighting)),
	];
	$.when(...promises).done(function(vertex, fragment, fractal, lighting) {
		vertex = vertex[0];
		fragment = fragment[0].format({fractal: fractal[0], lighting: lighting[0]});

		// Parse uniform variables.
		let re = /uniform\s+(\w+)\s+([A-Z\d_]+)(.+)/g;
		let match;
		this.params = {};
		while (match = re.exec(fragment)) {
			let name = match[2];
			let comment = match[3];
			let param = {
				type: match[1],
				default: +/default.+?([-\d.]+)/.exec(comment)[1],
				min: +/min.+?([-\d.]+)/.exec(comment)[1],
				max: +/max.+?([-\d.]+)/.exec(comment)[1],
				display: function() {
					if (param.type == 'float') {
						return '' + param.value.toFixed(4);
					} else {
						return '' + param.value;
					}
				}
			};
			if (scene.params[name] == undefined) {
				scene.params[name] = param.default;
			}
			param.value = scene.params[name];
			this.params[name] = param;
		}

		// Create parameter sliders.
		this.panel.params.empty();
		for (let [name, param] of Object.entries(this.params)) {
			let slider = $('<div class="param-slider"></div>').slider({
				value: param.value,
				min: param.min,
				max: param.max,
				step: param.type == 'int' ? 1 : 0.0001,
				slide: (event, ui) => {
					scene.params[name] = param.value = ui.value;
					$(event.target).siblings('.param-value').text(param.display());
					this.updateScene();
				},
			});
			$(`<div class="param">
				<span class="param-name">{0}: </span>
				<span class="param-value">{1}</span>			
			</div>`.format(name, param.display())).append(slider).appendTo(this.panel.params);
		}

		for (let view of layout.root.getComponentsByName('scene')) {
			view.initShader(vertex, fragment, this.params);
		}
	}.bind(this));
};

InspectorView.prototype.updateScene = function()
{
	for (let view of layout.root.getComponentsByName('scene')) {
		view.updateShader();
	}
};


function InspectorView(container, state)
{
	this.container = container.getElement().empty();

	this.panel = {
		selectors: $('<div class="panel"></div>').appendTo(this.container),
		params: $('<div class="panel"></div>').appendTo(this.container),
	};

	let fractal_select = $('<select>', {'class': 'fractal'}).appendTo(this.panel.selectors);
	for (let name of fs.readdirSync('src/renderers/fractal')) {
		$('<option>', {value: name, text: path.basename(name, '.glsl')}).appendTo(fractal_select);
	}
	fractal_select.on('change', this.onChange.bind(this));

	let lighting_select = $('<select>', {'class': 'lighting'}).appendTo(this.panel.selectors);
	for (let name of fs.readdirSync('src/renderers/lighting')) {
		$('<option>', {value: name, text: path.basename(name, '.glsl')}).appendTo(lighting_select);
	}
	lighting_select.on('change', this.onChange.bind(this));

	$('<div class="panel"></div>').appendTo(this.panel.params);
	this.params = null;

	this.onChange();
}

InspectorView.prototype.onChange = function(event)
{
	let fractal = this.panel.selectors.find('.fractal').val();
	let lighting = this.panel.selectors.find('.lighting').val();
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

		// Parse uniform variables.
		if (!event || $(event.target).hasClass('fractal')) {
			this.params = {};
			let re = /uniform\s+(\w+)\s+(\w+)(.+)/g;
			let match;
			while (match = re.exec(fractal[0])) {
				let name = match[2];
				let comment = match[3];
				this.params[name] = {
					type: match[1],
					value: +/default.+?([-\d.]+)/.exec(comment)[1],
					min: +/min.+?([-\d.]+)/.exec(comment)[1],
					max: +/max.+?([-\d.]+)/.exec(comment)[1],
				};
			}
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
					param.value = ui.value;
					$(event.target).siblings('.param-value').text(ui.value.toFixed(4));
					this.updateScene();
				},
			});
			$(`<div class="param">
				<span class="param-name">{0}: </span>
				<span class="param-value">{1}</span>			
			</div>`.format(name, param.value.toFixed(4))).append(slider).appendTo(this.panel.params);
		}

		for (let view of layout.root.getComponentsByName('scene')) {
			view.initShader(vertex[0], fragment[0].format({fractal: fractal[0], lighting: lighting[0]}), this.params);
		}
	}.bind(this));
};

InspectorView.prototype.updateScene = function()
{
	for (let view of layout.root.getComponentsByName('scene')) {
		view.updateShader();
	}
};

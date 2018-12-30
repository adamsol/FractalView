
function InspectorView(container, state)
{
	this.container = container.getElement().empty();

	let fractal_select = $('<select>', {'class': 'fractal'}).appendTo(this.container);
	for (let name of fs.readdirSync('src/renderers/fractal')) {
		$('<option>', {value: name, text: path.basename(name, '.glsl')}).appendTo(fractal_select);
	}
	fractal_select.on('change', this.onChange.bind(this));

	let lighting_select = $('<select>', {'class': 'lighting'}).appendTo(this.container);
	for (let name of fs.readdirSync('src/renderers/lighting')) {
		$('<option>', {value: name, text: path.basename(name, '.glsl')}).appendTo(lighting_select);
	}
	lighting_select.on('change', this.onChange.bind(this));

	this.onChange();
}

InspectorView.prototype.onChange = function()
{
	let fractal = this.container.find('.fractal').val();
	let lighting = this.container.find('.lighting').val();
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
		for (let view of layout.root.getComponentsByName('scene')) {
			view.initShader(vertex[0], fragment[0].format({fractal: fractal[0], lighting: lighting[0]}));
		}
	});
};

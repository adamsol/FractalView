
let layout;

$(function()
{
	let config = {
		content: [{
			type: 'row',
			content: [{
				type: 'component',
				title: 'Scene',
				componentName: 'scene',
				componentState: {},
			}, {
				type: 'component',
				title: 'Inspector',
				width: 15,
				componentName: 'inspector',
				componentState: {},
			}]
		}]
	};

	layout = new GoldenLayout(config);

	layout.registerComponent('scene', SceneView);
	layout.registerComponent('inspector', InspectorView);

	layout.init();
});

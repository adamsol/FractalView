
const electron = require('electron');

let layout;

function initLayout(config)
{
	layout = new GoldenLayout(config);
	layout.registerComponent('scene', SceneView);
	layout.registerComponent('inspector', InspectorView);
	layout.init();
}

let default_config = {
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
		}],
	}],
};

if (!localStorage['layout_config']) {
	initLayout(default_config);
} else {
	initLayout(JSON.parse(localStorage['layout_config']));
}

$(window).on('beforeunload', () => {
    localStorage['layout_config'] = JSON.stringify(layout.toConfig());
});

electron.ipcRenderer.on('resetLayout', (event) => {
	layout.destroy();
	initLayout(default_config);
});

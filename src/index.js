
const electron = require('electron');
const app = electron.remote.app;
const dialog = electron.remote.dialog;

let layout;
let current_path;
let scene = {};

function initLayout(config)
{
	layout = new GoldenLayout(config);
	layout.registerComponent('scene', SceneView);
	layout.registerComponent('inspector', InspectorView);
	layout.init();
}

function loadFractal(file_path)
{
	if (!file_path) {
		let data = {
			filters: [{name: 'Fractal', extensions: ['json']}],
			defaultPath: path.join(app.getAppPath(), 'data'),
		};
		dialog.showOpenDialog(data, files => {
			if (!files.length) {
				return;
			}
			loadFractal(files[0]);
		});
	} else {
		fs.readFile(file_path, (error, content) => {
			try {
				scene = JSON.parse(content);
				for (let view of layout.root.getComponentsByName('inspector')) {
					view.refresh();
				}
				for (let view of layout.root.getComponentsByName('scene')) {
					view.refreshCamera();
				}
				current_path = file_path;
			} catch (error) {
				console.error(file_path, error);
			}
		});
	}
}

function saveFractal(file_path)
{
	if (!file_path) {
		let data = {
			filters: [{name: 'Fractal', extensions: ['json']}],
			defaultPath: path.join(app.getAppPath(), 'data'),
		};
		dialog.showSaveDialog(data, file => {
			if (!file) {
				return;
			}
			saveFractal(file);
		});
	} else {
		let str = JSON.stringify(scene, null, '\t');
		fs.writeFile(file_path, str, (err) => {
			console.error(err);
		});
		current_path = file_path;
	}
}

function saveImage()
{
	let data = {
		filters: [{name: 'Image', extensions: ['jpg']}],
		defaultPath: path.join(app.getAppPath(), 'img'),
	};
	dialog.showSaveDialog(data, file => {
		if (!file) {
			return;
		}
		for (let view of layout.root.getComponentsByName('scene')) {
			let img = view.getImage();
			fs.writeFile(file, img, 'base64', (err) => {
				console.error(err);
			});
		}
	});
}


// Initialization

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


// Events

electron.ipcRenderer.on('resetLayout', (event) => {
	layout.destroy();
	initLayout(default_config);
});

electron.ipcRenderer.on('loadFractal', (event) => {
	loadFractal();
});
electron.ipcRenderer.on('saveFractal', (event) => {
	saveFractal(current_path);
});
electron.ipcRenderer.on('saveFractalAs', (event) => {
	saveFractal();
});
electron.ipcRenderer.on('saveImage', (event) => {
	saveImage();
});

$(window).on('beforeunload', () => {
	localStorage['layout_config'] = JSON.stringify(layout.toConfig());
});

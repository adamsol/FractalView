
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;

const electron = require('electron');
const electronWindowState = require('electron-window-state');

const app = electron.app;
const Menu = electron.Menu;

let mainWindow;

function createMainWindow()
{
	const state = electronWindowState({
		defaultWidth: 1280,
		defaultHeight: 800,
	});

	mainWindow = new electron.BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
		},
		x: state.x,
		y: state.y,
		width: state.width,
		height: state.height,
	});
	state.manage(mainWindow);

	mainWindow.loadURL(`file://${__dirname}/src/index.html`);
	mainWindow.on('closed', () => mainWindow = null);

	//mainWindow.webContents.toggleDevTools();
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		createMainWindow();
	}
});

app.on('ready', () => {
	createMainWindow();

	function execute() {
		return () => mainWindow.webContents.send.apply(mainWindow.webContents, arguments);
	}

	const menu_template = [
		{
			label: 'File',
			submenu: [
				{label: 'Open', click: execute('loadFractal'), accelerator: 'CmdOrCtrl+O'}, {type: 'separator'},
				{label: 'Save', click: execute('saveFractal'), accelerator: 'CmdOrCtrl+S'}, {label: 'Save As', click: execute('saveFractalAs'), accelerator: 'CmdOrCtrl+Shift+S'}, {type: 'separator'},
				{label: 'Save Image', click: execute('saveImage'), accelerator: 'CmdOrCtrl+E'}, {type: 'separator'},
				{role: 'quit'},
			],
		},
		{
			label: 'View',
			submenu: [
				{role: 'reload'}, {role: 'toggledevtools'}, {type: 'separator'},
				{label: 'Reset Layout', click: execute('resetLayout')}, {type: 'separator'},
				{role: 'resetzoom'}, {role: 'zoomin'}, {role: 'zoomout'}, {type: 'separator'}, {role: 'togglefullscreen'},
			],
		},
	];
	Menu.setApplicationMenu(Menu.buildFromTemplate(menu_template));
});

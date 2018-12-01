
const electron = require('electron');
const electronWindowState = require('electron-window-state');

const app = electron.app;

let mainWindow;

function createMainWindow()
{
	const state = electronWindowState({
		defaultWidth: 1280,
    	defaultHeight: 800,
	});

	mainWindow = new electron.BrowserWindow({
		x: state.x,
		y: state.y,
		width: state.width,
		height: state.height,
	});
	state.manage(mainWindow);

	mainWindow.loadURL(`file://${__dirname}/src/index.html`);
	mainWindow.on('closed', () => mainWindow = null);
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
});

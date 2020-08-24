const electron = require('electron');
const app = electron.app;
const app_path = app.getAppPath();
const fixpath = require('fix-path');
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const isDev = require('electron-is-dev');
const {spawn, spawnSync, exec, execSync} = require('child_process');
const os = require('os');
var adjusted_app_path;
isDev ? adjusted_app_path = app_path : adjusted_app_path = path.join(app_path, '../app.asar.unpacked');
var log = require('electron-log');
const interfaces = require('../src/interfaces/interfaces').interfaces,
    interp = interfaces.interpreter;
log.transports.console.level = "debug";
//TODO: figure out way around fixpath dependency
fixpath();

//TODO: replace gRPC with gRPC-js for better compatibility with electron https://www.npmjs.com/package/@grpc/grpc-js
const windows = {};

function open_log_file(){
    exec(`open ${path.join(os.homedir(),'Library','Logs','psyneulinkview','log.log')}`)
}

function open_log_folder(){
    exec(`open ${path.join(os.homedir(),'Library','Logs','psyneulinkview')}`)
}

function createWindow() {
    var mainWindow;
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            preload: path.join(isDev ? __dirname : `${adjusted_app_path}/build/`, 'preload.js')
        }
    });
    if (isDev) {BrowserWindow.addDevToolsExtension(
        path.join(os.homedir(), 'AppData/Local/Google/Chrome/User Data/Profile 1/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.8.2_0')
        )}
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(adjusted_app_path, 'build/index.html')}`);
    mainWindow.on('closed', () => {
            interp.kill_rpc_server();
            app.quit();
        }
    );
    mainWindow.on("uncaughtException", (err) => {
            electron.dialog.showErrorBox(
                'error',
                err.message
            )
        }
    );
    mainWindow.setTitle('PsyNeuLinkView');
    mainWindow.webContents.send('appPath', adjusted_app_path);
    windows['renderMain'] = mainWindow;
}

app.on('ready', function () {
    createWindow();
});

app.on('window-all-closed', function(){
    interp.kill_rpc_server();
    app.quit();
});

app.on('quit', () => {
    app.quit();
    interp.kill_rpc_server();
});

exports.windows = windows;
exports.app_path = adjusted_app_path;
exports.isDev = isDev;
exports.interfaces = interfaces;
exports.open_log_file = open_log_file;
exports.open_log_folder = open_log_folder;
exports.app_path = adjusted_app_path;
exports.addRecentDocument = app.addRecentDocument;
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');
const ini = require('ini');
const fs = require('fs');

let mainWindow;
var child_proc;
var config = ini.parse(fs.readFileSync(path.join(__dirname,'../config.ini'), 'utf-8'))
var py_int_path = config.python.interpreter_path;
var pnl_path = config.python.psyneulink_path;

function spawn_rpc_server() {
    child_proc = spawn(py_int_path, ['-u', path.join(__dirname,'../src/py/rpc_server.py'),pnl_path]);
    child_proc.stdout.setEncoding('utf8');
    child_proc.stdout.on('data', function(data){
        console.log('py stdout: ' + data)
    });
    child_proc.stderr.setEncoding('utf8');
    child_proc.stderr.on('data', function(data){
        console.log('py stderr: ' + data)
    });
}

function restart_rpc_server(){
    child_proc.kill();
    child_proc = spawn(py_int_path, [path.join(__dirname,'../src/py/rpc_server.py')]);
}
function createWindow() {
    console.log(path.join(__dirname,'../src/utility/rpc/rpc_preload.js'));
    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            nodeIntegration: false,
            preload: path.join(__dirname, '../src/utility/rpc/rpc_preload.js')
        }
    });
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
    mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', function(){
    // spawn_rpc_server();
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

exports.restart_rpc_server = restart_rpc_server
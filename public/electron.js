const electron = require('electron');
const app = electron.app;
const app_path = app.getAppPath();
console.log(app_path);
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');

let mainWindow;
var config = require(path.join(app_path,'config.json'));
var py_int_path = config.Python['Interpreter Path'];
var pnl_path = config.Python['PsyNeuLink Path'];
var child_proc;

function spawn_rpc_server() {
    child_proc = spawn(py_int_path, ['-u', path.join(app_path,'/src/py/rpc_server.py'),pnl_path]);
    child_proc.on('error', function (err) {
        console.log('FAILED TO START PYTHON PROCESS. FOLLOWING ERROR GENERATED: ', err)
    });
    child_proc.stdout.setEncoding('utf8');
    child_proc.stdout.on('data', function(data){
        console.log('py stdout: ' + data)
    });
    child_proc.stderr.setEncoding('utf8');
    child_proc.stderr.on('data', function(data){
        console.log('py stderr: ' + data)
    });
    exports.child_proc = child_proc
}

function restart_rpc_server(child_proc){
    child_proc.kill();
    child_proc = spawn_rpc_server();
}
function createWindow() {
    console.log(path.join(app_path,'/src/utility/rpc/preload.js'));
    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(app_path, 'build/index.html')}`);
    mainWindow.on('closed', () =>
        {app.quit()}
    );
}

app.on('ready', function(){
    spawn_rpc_server();
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('quit', () => {
    try {
        child_proc.kill()
    }
    catch{
        console.log('FAILED TO END CHILD PROCESS')
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

exports.restart_rpc_server = restart_rpc_server;
exports.app_path = app_path;
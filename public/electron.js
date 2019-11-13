const electron = require('electron');
const app = electron.app;
const app_path = app.getAppPath();
const fixpath = require('fix-path');
console.log(app_path);
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');
var log = require('electron-log');

log.transports.console.level = "debug";
log.debug(process.env);
log.debug('a problem check');

let mainWindow;
var child_proc;

//TODO: figure out way around fixpath dependency
fixpath();

class RPCServerMaintainer{
    child_proc = null;

    spawn_rpc_server() {
        var config = require(path.join(app_path,'config.json'));
        var py_int_path = config.Python['Interpreter Path'];
        var pnl_path = config.Python['PsyNeuLink Path'];
        child_proc = spawn(py_int_path, ['-u', path.join(app_path,'/src/py/rpc_server.py'),pnl_path], {shell: true});
        child_proc.on('error', function (err) {
            console.log('FAILED TO START PYTHON PROCESS. FOLLOWING ERROR GENERATED: ', err)
            log.debug('py stdout:' + err)
        });
        child_proc.stdout.setEncoding('utf8');
        child_proc.stdout.on('data', function(data){
            console.log('py stdout: ' + data);
            log.debug('py stdout:' + data)
        });
        child_proc.stderr.setEncoding('utf8');
        child_proc.stderr.on('data', function(data){
            console.log('py stderr: ' + data)
            log.debug('py stdout:' + data)
        });
        this.child_proc = child_proc;
        exports.child_proc = child_proc;
    }

    restart_rpc_server(){
        if (this.child_proc != null){
            this.child_proc.kill()
        }
        this.spawn_rpc_server()
    }
}

var server_maintainer = new RPCServerMaintainer();

function restart_rpc_server(){
    server_maintainer.restart_rpc_server()
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
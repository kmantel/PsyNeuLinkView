const electron = require('electron');
const app = electron.app;
const app_path = app.getAppPath();
const fixpath = require('fix-path');
console.log(app_path);
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
var adjusted_app_path;
isDev?adjusted_app_path=app_path:adjusted_app_path=path.join(app_path,'../app.asar.unpacked');
exports.app_path = adjusted_app_path;
var log = require('electron-log');

exports.isDev = isDev;
log.transports.console.level = "debug";

let mainWindow;
var child_proc;

//TODO: figure out way around fixpath dependency
fixpath();

class RPCServerMaintainer{
    constructor(){
        this.config_edited = false;
        this.initialize_config();
    }

    obj_key_copy(template_obj, user_obj){
        Object.keys(template_obj).forEach(
            (key) => {
                if (!(key in user_obj)){
                    user_obj[key] = {...template_obj[key]};
                    this.config_edited = true;
                }
            }
        );
        Object.keys(template_obj).forEach(
            (key) => {
                this.obj_key_copy(template_obj[key], user_obj[key])
            }
        );
        return user_obj
    }

    initialize_config(){
        var config_filepath = path.join(adjusted_app_path,'config.json');
        if (!fs.existsSync(config_filepath)){
            fs.writeFileSync(config_filepath,JSON.stringify({}))
        }
        var config_current = require(config_filepath);
        var config_template_filepath = path.join(adjusted_app_path,'config_template.json');
        var config_template = require(config_template_filepath);
        this.config = this.obj_key_copy(config_template, config_current);
        if (this.config_edited){
            var cf_client_module = require(path.join(adjusted_app_path,'src/utility/config/config_client.js'));
            var cf_client = new cf_client_module.ConfigClient(config_filepath);
            cf_client.set_config(this.config);
        }
    }

    child_proc = null;

    check_for_conda(interpreter_path) {
        var interpreter_dir = path.dirname(interpreter_path);
        if (os.platform() === 'win32'){
            if (fs.existsSync(path.join(interpreter_dir,'conda-meta'))){
                var separated_interpreter_dir = interpreter_dir.split(path.sep);
                return separated_interpreter_dir[separated_interpreter_dir.length -1];
            }
        }
        else {
            if (fs.existsSync(path.join(interpreter_dir,'..','conda-meta'))){
                var separated_interpreter_dir = interpreter_dir.split(path.sep);
                return separated_interpreter_dir[separated_interpreter_dir.length - 2];
            }
        }
        return false
    }

    spawn_rpc_server() {
        var config = require(path.join(adjusted_app_path,'config.json'));
        var py_int_path = config.Python['Interpreter Path'];
        var pnl_path = config.Python['PsyNeuLink Path'];
        var conda_dir = this.check_for_conda(py_int_path);
        var conda_prefix;
        conda_dir?
            os.platform() === 'win32'?
                conda_prefix = '' +
                    `${path.resolve(path.join(path.dirname(py_int_path),'..','..','Scripts','activate.bat'))} & ` +
                    `conda activate ${conda_dir} & `
                :
                conda_prefix = `
                    source $(conda info --base)/etc/profile.d/conda.sh; 
                    conda activate ${conda_dir}; 
                `
            :
            conda_prefix = '';
        log.debug(conda_prefix + py_int_path);
        child_proc = spawn(conda_prefix + py_int_path,
            ['-u', path.join(adjusted_app_path,'/src/py/rpc_server.py'),
                pnl_path], {shell: true});
        child_proc.on('error', function (err) {
            console.log('FAILED TO START PYTHON PROCESS. FOLLOWING ERROR GENERATED: ', err);
            log.debug('py stdout:' + err)
        });
        child_proc.stdout.setEncoding('utf8');
        child_proc.stdout.on('data', function(data){
            console.log('py stdout: ' + data);
            log.debug('py stdout:' + data)
        });
        child_proc.stderr.setEncoding('utf8');
        child_proc.stderr.on('data', function(data){
            console.log('py stderr: ' + data);
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
    console.log(path.join(adjusted_app_path,'/src/utility/rpc/preload.js'));
    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(isDev?__dirname : `${adjusted_app_path}/build/`, 'preload.js')
        }
    });
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(adjusted_app_path, 'build/index.html')}`);
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
exports.app_path = adjusted_app_path;
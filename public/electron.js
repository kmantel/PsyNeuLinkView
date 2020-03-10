const electron = require('electron');
const app = electron.app;
const app_path = app.getAppPath();
const fixpath = require('fix-path');
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const isDev = require('electron-is-dev');
const {spawn, spawnSync, exec, execSync} = require('child_process');
const fs = require('fs');
const os = require('os');
const config_client = require(path.join(app_path, 'src/utility/config/config_client.js'));
const compareVersions = require('compare-versions');
var adjusted_app_path;
isDev ? adjusted_app_path = app_path : adjusted_app_path = path.join(app_path, '../app.asar.unpacked');
exports.app_path = adjusted_app_path;
var log = require('electron-log');
var isWin = os.platform() === 'win32';

exports.isDev = isDev;
log.transports.console.level = "debug";

let mainWindow;
var a = 0;
//TODO: figure out way around fixpath dependency
fixpath();

class RPCInterface {
    constructor() {
        this.app_path = app_path;
        this.config_edited = false;
        isWin ?
            this.config_filedir = path.join(os.homedir(), 'AppData', 'Roaming', 'PsyNeuLinkView')
            :
            this.config_filedir = path.join(os.homedir(), 'Library', 'Preferences', 'PsyNeuLinkView');
        this.config_filepath = path.join(this.config_filedir, 'config.json');
        exports.config_filepath = this.config_filepath;
        this.initialize_config();
        this.validate_interpreter_path = this.validate_interpreter_path.bind(this);
        this.child_procs = [];
    }

    obj_key_copy(template_obj, user_obj) {
        Object.keys(template_obj).forEach(
            (key) => {
                if (!(key in user_obj)) {
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

    create_new_config() {
        if (!fs.existsSync(this.config_filedir)) {
            fs.mkdirSync(this.config_filedir)
        }
        fs.writeFileSync(this.config_filepath, JSON.stringify({}))
    }

    initialize_config() {
        if (!fs.existsSync(this.config_filepath)) {
            this.create_new_config()
        }
        var config_current = require(this.config_filepath);
        var config_template_filepath = path.join(this.app_path, 'config_template.json');
        var config_template = require(config_template_filepath);
        this.config = this.obj_key_copy(config_template, config_current);
        this.config_client = new config_client.ConfigClient(this.config_filepath);
        if (this.config_edited) {
            this.config_client.set_config(this.config);
        }
    }

    validate_interpreter_path(filepath, callback) {
        var py_int_path = filepath;
        this.check_conda(py_int_path,
            (err, stat, interpreter_path) => {
                if (!stat) {
                    this.execute_validation_script('', interpreter_path, callback)
                } else {
                    this.find_conda_binary(
                        interpreter_path,
                        (err, stat, one_level_up, path_to_check, original_interpreter_path, possible_conda_binary) => {
                            if (one_level_up === path_to_check) {
                                this.execute_validation_script('', interpreter_path, callback)
                            } else {
                                this.find_env_name(original_interpreter_path, possible_conda_binary,
                                    (err, stdout, stderr, env_name, binary_path, interpreter_path) => {
                                        this.construct_prefix(env_name, binary_path, interpreter_path,
                                            (conda_prefix, interpreter_path) => {
                                                this.execute_validation_script(conda_prefix, interpreter_path, callback)
                                            }
                                        );
                                    }
                                )
                            }
                        }
                    )
                }
            }
        );
    }

    spawn_rpc_server(callback, errorhandler) {
        var config = this.config_client.get_config();
        var py_int_path = config.Python['Interpreter Path'];
        this.check_conda(py_int_path,
            (err, stat, interpreter_path) => {
                if (!stat) {
                    this.start_server('', interpreter_path, callback, errorhandler)
                } else {
                    this.find_conda_binary(
                        interpreter_path,
                        (err, stat, one_level_up, path_to_check, original_interpreter_path, possible_conda_binary) => {
                            if (one_level_up === path_to_check) {
                                this.start_server('', original_interpreter_path, callback, errorhandler)
                            } else {
                                this.find_env_name(original_interpreter_path, possible_conda_binary,
                                    (err, stdout, stderr, env_name, binary_path, interpreter_path) => {
                                        this.construct_prefix(env_name, binary_path, interpreter_path,
                                            (conda_prefix, interpreter_path) => {
                                                this.start_server(conda_prefix, interpreter_path, callback, errorhandler)
                                            }
                                        );
                                    }
                                )
                            }
                        }
                    )
                }
            }
        );
    }

    check_conda(interpreter_path, callback) {
        var interpreter_dir = path.dirname(interpreter_path);
        var path_to_check;
        if (isWin) {
            path_to_check = path.join(interpreter_dir, 'conda-meta')
        } else {
            path_to_check = path.join(interpreter_dir, '..', 'conda-meta')
        }

        log.debug('' +
            'check_conda' +
            '\n ' +
            '\n' +
            `interpreter_dir: ${interpreter_dir}` +
            '\n' +
            `interpreter_dir: ${path_to_check}`
        );

        fs.stat(path_to_check,
            (err, stat) => {
                callback(err, stat, interpreter_path);
            });
        return false
    }

    find_conda_binary(original_interpreter_path, callback, path_to_check = '') {
        if (!path_to_check) {
            path_to_check = path.join(original_interpreter_path, '..');
        }
        var one_level_up = path.join(path_to_check, '..');
        var possible_conda_binary = path.join(path_to_check, 'activate');

        log.debug('' +
            'find_conda_binary' +
            '\n ' +
            '\n' +
            `original_interpreter_path: ${original_interpreter_path}` +
            '\n' +
            `path_to_check: ${path_to_check}` +
            '\n' +
            `one_level_up: ${one_level_up}` +
            '\n' +
            `possible_conda_binary: ${possible_conda_binary}`
        );

        fs.stat(possible_conda_binary,
            (err, stat) => {
                if (!stat && !(one_level_up === path_to_check)) {
                    if (!(one_level_up === path_to_check)) {
                        this.find_conda_binary(original_interpreter_path, callback, one_level_up)
                    }
                } else {
                    callback(err, stat, one_level_up, path_to_check, original_interpreter_path, possible_conda_binary);
                }
            })
    }

    find_env_name(interpreter_path, binary_path, callback) {
        var interpreter_dir = path.dirname(interpreter_path);
        var path_to_check = path.join(interpreter_dir, '..');
        var env_path_len = path_to_check.length;
        var binary_path = binary_path;

        log.debug('' +
            'find_env_name' +
            '\n ' +
            '\n' +
            `interpreter_dir: ${interpreter_dir}` +
            '\n' +
            `path_to_check: ${path_to_check}` +
            '\n' +
            `env_path_len: ${env_path_len}` +
            '\n' +
            `binary_path: ${binary_path}`
        );


        exec(`source ${binary_path} && conda env list`,
            (err, stdout, stderr) => {
                var envs = stdout.split('\n');
                for (var i in envs) {
                    var i_len = envs[i].length;
                    if (i_len >= env_path_len) {
                        if (envs[i].slice(i_len - env_path_len - 1, i_len) == ` ${path_to_check}`) {
                            var env_name_re = new RegExp(/\w*/);
                            var env_name = envs[i].match(env_name_re)[0];
                            callback(err, stdout, stderr, env_name, binary_path, interpreter_path);
                        }
                    }
                }
            }
        )
    }

    construct_prefix(env_name, binary_path, interpreter_path, callback) {
        var interpreter_path = interpreter_path;
        exec(`source "${binary_path}" && conda --version`,
            (err, stdout, stderr) => {
                var activation_command;
                if (compareVersions(stdout.replace('conda','').trim(),'4.6.0') >= 0){
                    activation_command = 'conda activate'
                }
                else {
                    activation_command = 'source activate'
                }
                log.debug('ACTIVATION COMMAND', activation_command);
                var conda_prefix = '' +
                    `source "${binary_path}" && ` +
                    `${activation_command} ${env_name} && `;
                log.debug('' +
                    'construct_prefix' +
                    '\n ' +
                    '\n' +
                    `interpreter_path: ${interpreter_path}` +
                    '\n' +
                    `conda_prefix: ${conda_prefix}`
                );
                callback(conda_prefix, interpreter_path);
            }
        );
    }

    start_server(prefix = '', interpreter_path, callback, errorhandler) {
        var callback = callback;
        var config = this.config_client.get_config();
        var pnl_path = config['Python']['PsyNeuLink Path'];
        pnl_path = pnl_path ? pnl_path : '';
        log.debug('' +
            'execute_script' +
            '\n ' +
            '\n' +
            `prefix: ${prefix}` +
            '\n' +
            `interpreter_path: ${interpreter_path}` +
            '\n' +
            `pnl_path: ${pnl_path}` +
            '\n' +
            `full command: ${
                [prefix + interpreter_path,
                    [
                        '-u -W ignore',
                        `"${path.join(adjusted_app_path, 'src', 'py', 'rpc_server.py')}"`,
                        `"${pnl_path}"`
                    ]
                ]
            }`
        );
        this.child_proc = spawn(prefix + interpreter_path,
            [
                '-u -W ignore',
                `"${path.join(adjusted_app_path, 'src', 'py', 'rpc_server.py')}"`,
                `"${pnl_path}"`
            ],
            {
                shell: true,
                detached: isWin? false : true
            }
        );
        this.child_proc.on('error', function (err) {
            log.debug('py stdout:' + err)
        });
        this.child_proc.stdout.setEncoding('utf8');
        this.child_proc.stdout.on('data', function (data) {
            if (data.trim() === 'PYTHON SERVER READY'){
                if (callback){
                    log.debug('py stdout:' + data);
                    callback()
                }
            }
        });
        this.child_proc.stderr.setEncoding('utf8');
        this.child_proc.stderr.on('data', function (data) {
            if (errorhandler){
                errorhandler()
            }
            log.debug('py stderr:' + data);
        });
    }

    execute_validation_script(prefix = '', interpreter_path, callback){
        var config = this.config_client.get_config();
        var pnl_path = config['Python']['PsyNeuLink Path'];
        pnl_path = pnl_path ? pnl_path : '';
        log.debug('' +
            'execute_validation_script' +
            '\n ' +
            '\n' +
            `prefix: ${prefix}` +
            '\n' +
            `interpreter_path: ${interpreter_path}` +
            '\n' +
            `pnl_path: ${pnl_path}` +
            '\n' +
            `full command: ${
                [prefix + `"${interpreter_path}"`,
                    [
                        '-u',
                        `${path.join(adjusted_app_path, 'src', 'py', 'validate_interpreter.py')}`,
                        `${pnl_path}`
                    ]
                ]
            }`
        );

        var launch_interpreter_validater_cmd = `${prefix} "${interpreter_path}" -u "${path.join(adjusted_app_path, 'src', 'py', 'validate_interpreter.py')}" "${pnl_path}"`;
        exec(launch_interpreter_validater_cmd,
            {
                shell: true,
                detached: true
            },
            (err, stdout, stderr)=>{
                callback(err, stdout, stderr);
            }
        );
    }

    kill_rpc_server() {
        if (this.child_proc) {
            try {
                if (isWin) {
                    spawnSync("taskkill", [
                            "/PID", this.child_proc.pid, '/F', '/T'
                        ],
                    );
                    this.child_proc = null
                } else {
                    process.kill(-this.child_proc.pid);
                    // this.child_proc.kill();
                    this.child_proc = null;
                }
            }
            catch (e) {
                
            }
        }
    }

    restart_rpc_server(callback, errorhandler) {
        this.kill_rpc_server();
        this.spawn_rpc_server(callback, errorhandler);
    }
}

var server_maintainer = new RPCInterface(app_path);

function restart_rpc_server(callback, errorhandler) {
    server_maintainer.restart_rpc_server(callback, errorhandler)
}

function validate_interpreter_path(filepath, callback){
    server_maintainer.validate_interpreter_path(filepath, callback)
}

function open_log_file(){
    exec(`open ${path.join(os.homedir(),'Library','Logs','psyneulinkview','log.log')}`)
}

function open_log_folder(){
    exec(`open ${path.join(os.homedir(),'Library','Logs','psyneulinkview')}`)
}

function createWindow() {
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(isDev ? __dirname : `${adjusted_app_path}/build/`, 'preload.js')
        }
    });
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(adjusted_app_path, 'build/index.html')}`);
    mainWindow.on('closed', () => {
            server_maintainer.kill_rpc_server();
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
    mainWindow.setTitle('PsyNeuLinkView')
}

app.on('ready', function () {
    createWindow();
});

app.on('window-all-closed', () => {
    server_maintainer.kill_rpc_server();
    app.quit();
});

app.on('quit', () => {
    try {
        server_maintainer.kill_rpc_server();
        app.quit()
    } catch {
        console.log('FAILED TO END CHILD PROCESS')
    }
});

// app.disableHardwareAcceleration();

exports.open_log_file = open_log_file;
exports.open_log_folder = open_log_folder;
exports.server_maintainer = server_maintainer;
exports.restart_rpc_server = restart_rpc_server;
exports.validate_interpreter_path = validate_interpreter_path;
exports.app_path = adjusted_app_path;
exports.addRecentDocument = app.addRecentDocument;
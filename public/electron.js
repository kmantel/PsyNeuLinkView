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
// var { RPCInterface } = require('/Users/ds70/WebstormProjects/PsyNeuLinkView/src/utility/rpc/rpc_interface.js');
var adjusted_app_path;
isDev ? adjusted_app_path = app_path : adjusted_app_path = path.join(app_path, '../app.asar.unpacked');
exports.app_path = adjusted_app_path;
var log = require('electron-log');

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
        os.platform() === 'win32' ?
            this.config_filedir = path.join(os.homedir(), 'AppData', 'PsyNeuLinkView')
            :
            this.config_filedir = path.join(os.homedir(), 'Library', 'Preferences', 'PsyNeuLinkView');
        this.config_filepath = path.join(this.config_filedir, 'config.json');
        exports.config_filepath = this.config_filepath;
        this.initialize_config();
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
        if (this.config_edited) {
            var cf_client_module = require(path.join(this.app_path, 'src/utility/config/config_client.js'));
            var cf_client = new cf_client_module.ConfigClient(this.config_filepath);
            cf_client.set_config(this.config);
        }
    }

    check_conda(interpreter_path) {
        var interpreter_dir = path.dirname(interpreter_path);
        var path_to_check;
        if (os.platform() === 'win32') {
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
                if (!stat) {
                    this.execute_script('', interpreter_path)
                } else {
                    this.find_conda_binary(interpreter_path)
                }
            });
        return false
    }

    find_conda_binary(original_interpreter_path, path_to_check = '') {
        if (!path_to_check) {
            path_to_check = path.join(original_interpreter_path, '..');
        }
        var one_level_up = path.join(path_to_check, '..');
        var possible_conda_binary = path.join(path_to_check, 'etc', 'profile.d', 'conda.sh');

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
                if (!stat) {
                    if (!(one_level_up === path_to_check)) {
                        this.find_conda_binary(original_interpreter_path, one_level_up)
                    }
                    else {
                        this.execute_script(original_interpreter_path)
                    }
                } else {
                    this.find_env_name(original_interpreter_path, possible_conda_binary)
                }
            })
    }

    find_env_name(interpreter_path, binary_path) {
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
                            this.construct_prefix(env_name, binary_path, interpreter_path);
                        }
                    }
                }
            }
        )
    }

    construct_prefix(env_name, binary_path, interpreter_path) {
        var interpreter_path = interpreter_path
        var conda_prefix = '' +
            `source ${binary_path} && ` +
            `conda activate ${env_name} && `;

        log.debug('' +
            'construct_prefix' +
            '\n ' +
            '\n' +
            `interpreter_path: ${interpreter_path}` +
            '\n' +
            `conda_prefix: ${conda_prefix}`
        );

        this.execute_script(
            conda_prefix, interpreter_path
        )
    }

    execute_script(prefix = '', interpreter_path) {
        var pnl_path = this.config['Python']['PsyNeuLink Path'];
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
                        '-u',
                        path.join(adjusted_app_path, 'src', 'py', 'rpc_server.py'),
                        pnl_path
                    ]
                ]
            }`
        );
        a += 1;
        console.log('THIS IS THE INCREMENTER', a);
        this.child_proc = spawn(prefix + interpreter_path,
            [
                '-u',
                path.join(adjusted_app_path, 'src', 'py', 'rpc_server.py'),
                pnl_path
            ],
            {
                shell: true,
                detached: true
            }
        );
        this.child_proc.on('error', function (err) {
            log.debug('py stdout:' + err)
        });
        this.child_proc.stdout.setEncoding('utf8');
        this.child_proc.stdout.on('data', function (data) {
            log.debug('py stdout:' + data)
        });
        this.child_proc.stderr.setEncoding('utf8');
        this.child_proc.stderr.on('data', function (data) {
            log.debug('py stdout:' + data);
        });
    }

    spawn_rpc_server() {
        console.log('spawn');
        var config = require(this.config_filepath);
        var py_int_path = config.Python['Interpreter Path'];
        this.check_conda(py_int_path);
    }

    kill_rpc_server() {
        if (this.child_proc != null) {
            console.log('YES');
            if (os.platform() === 'win32') {
                spawnSync("taskkill", [
                        "/PID", this.child_proc.pid, '/F', '/T'
                    ],
                );
                this.child_proc = null
            } else {
                process.kill(-this.child_proc.pid);
                console.log(this.child_proc);
                // this.child_proc.kill();
                this.child_proc = null;
            }
        }
    }

    restart_rpc_server() {
        this.kill_rpc_server();
        this.spawn_rpc_server()
    }
}

var server_maintainer = new RPCInterface(app_path);

function restart_rpc_server() {
    server_maintainer.restart_rpc_server()
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

exports.server_maintainer = server_maintainer;
exports.restart_rpc_server = restart_rpc_server;
exports.app_path = adjusted_app_path;
exports.addRecentDocument = app.addRecentDocument;
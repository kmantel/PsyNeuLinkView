const {spawn, spawnSync, exec, execSync} = require('child_process');
const log = require('electron-log');
const path = require('path');
const os = require('os');
const fs = require('fs');


class RPCInterface {
    constructor(app_path) {
        this.app_path = app_path;
        this.config_edited = false;
        os.platform() === 'win32' ?
            this.config_filedir = path.join(os.homedir(), 'AppData', 'PsyNeuLinkView')
            :
            this.config_filedir = path.join(os.homedir(), 'Library', 'Preferences', 'PsyNeuLinkView');
        this.config_filepath = path.join(this.config_filedir, 'config.json');
        exports.config_filepath = this.config_filepath;
        this.initialize_config();
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

    child_proc = null;

    get_env_name(env_path, conda_binary_path) {
        var env_name;
        var env_path_len = env_path.length;
        var envs = decodeURIComponent(
            escape(
                execSync(
                    `source ${conda_binary_path} && conda env list`
                )
            )
        ).split('\n');
        for (var i in envs) {
            var i_len = envs[i].length;
            if (i_len >= env_path_len) {
                if (envs[i].slice(i_len - env_path_len - 1, i_len) == ` ${env_path}`) {
                    var env_name_re = new RegExp(/\w*/);
                    var env_name = envs[i].match(env_name_re)[0];
                    return env_name;
                }
            }
        }
    };

    get_conda_env_dir(interpreter_path) {
        var interpreter_dir = path.dirname(interpreter_path);
        if (os.platform() === 'win32') {
            if (fs.existsSync(path.join(interpreter_dir, 'conda-meta'))) {
                return interpreter_dir;
            }
        } else {
            if (fs.existsSync(path.join(interpreter_dir, '..', 'conda-meta'))) {
                return path.join(interpreter_dir, '..');
            }
        }
        return false
    }

    check_for_base_env(env_name, conda_binary_path) {

    }

    find_conda_binarySync(filepath) {
        return fs.existsSync(
            path.join(path.dirname(filepath), '..', 'etc', 'profile.d', 'conda.sh')
        ) ?
            path.join(path.dirname(filepath), '..', 'etc', 'profile.d', 'conda.sh')
            :
            fs.existsSync(
                path.join(path.dirname(filepath), '..')
            ) && path.join(path.dirname(filepath), '..') !== path.dirname(filepath)
                ? this.find_conda_binarySync(path.join(path.dirname(filepath), '..')) :
                false
    }

    check_conda(interpreter_path) {
        var interpreter_dir = path.dirname(interpreter_path);
        var path_to_check;
        if (os.platform() === 'win32') {
            path_to_check = path.join(interpreter_dir, 'conda-meta')
        } else {
            path_to_check = path.join(interpreter_dir, '..', 'conda-meta')
        }
        fs.stat(path_to_check,
            (err, stat) => {
                if (!stat) {
                    this.execute_script('',interpreter_path)
                } else {
                    this.find_conda_binary(interpreter_path)
                }
            });
        return false
    }

    find_conda_binary(original_interpreter_path, path_to_check='') {
        if (!path_to_check){
            path_to_check = path.join(original_interpreter_path, '..');
        }
        var one_level_up = path.join(path_to_check, '..');
        var possible_conda_binary = path.join(path_to_check, 'etc', 'profile.d', 'conda.sh');
        fs.stat(possible_conda_binary,
            (err, stat) => {
                if (!stat) {
                    if (!(one_level_up === path_to_check)) {
                        this.find_conda_binary(original_interpreter_path, one_level_up)
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

    construct_prefix(env_name, binary_path, interpreter_path){
        var interpreter_path = interpreter_path
        var conda_prefix = '' +
            `source ${binary_path} && ` +
            `conda activate ${env_name} && `;
        this.execute_script(
            conda_prefix, interpreter_path
        )
    }

    execute_script(prefix = '', interpreter_path) {
        console.log(prefix, interpreter_path);
        this.child_proc = spawn(prefix + interpreter_path,
            ['-u','/Users/ds70/WebstormProjects/PsyNeuLinkView/src/py/rpc_server.py',
                ''], {
                shell: true,
                detached: false
            });
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
        var config = require(this.config_filepath);
        var py_int_path = config.Python['Interpreter Path'];
        this.check_conda(py_int_path);
    }

    // spawn_rpc_server() {
    //     var config = require(this.config_filepath);
    //     var py_int_path = config.Python['Interpreter Path'];
    //     var pnl_path = config.Python['PsyNeuLink Path'];
    //     var self = this;
    //     var conda_prefix;
    //     var conda_binary_path = false;
    //     var conda_env_dir = this.get_conda_env_dir(py_int_path);
    //     if (conda_env_dir) {
    //         conda_binary_path = this.find_conda_binarySync(py_int_path)
    //     }
    //     console.log(conda_env_dir, conda_binary_path);
    //     var conda_env_name = this.get_env_name(conda_env_dir, conda_binary_path);
    //     console.log('env name', conda_env_dir);
    //     conda_binary_path ?
    //         os.platform() === 'win32' ?
    //             conda_prefix = '' +
    //                 `${path.resolve(path.join(path.dirname(py_int_path), '..', '..', 'Scripts', 'activate.bat'))} && ` +
    //                 `conda activate ${conda_env_name} && `
    //             :
    //             conda_prefix = '' +
    //                 `source ${conda_binary_path} && ` +
    //                 `conda activate ${conda_env_name} && `
    //         :
    //         conda_prefix = '';
    //     log.debug(conda_prefix + py_int_path);
    //     this.child_proc = spawn(conda_prefix + py_int_path,
    //         ['-u', path.join(this.app_path, '/src/py/rpc_server.py'),
    //             pnl_path], {
    //             shell: true,
    //             detached: false
    //         });
    //     this.child_proc.on('error', function (err) {
    //         log.debug('py stdout:' + err)
    //     });
    //     this.child_proc.stdout.setEncoding('utf8');
    //     this.child_proc.stdout.on('data', function (data) {
    //         log.debug('py stdout:' + data)
    //     });
    //     this.child_proc.stderr.setEncoding('utf8');
    //     this.child_proc.stderr.on('data', function (data) {
    //         log.debug('py stdout:' + data);
    //     });
    // }

    kill_rpc_server(child_proc = this.child_proc) {
        if (child_proc != null) {
            if (os.platform() === 'win32') {
                spawnSync("taskkill", [
                        "/PID", child_proc.pid, '/F', '/T'
                    ],
                );
                child_proc = null
            } else {
                child_proc.kill()
            }
        }
    }

    restart_rpc_server() {
        this.kill_rpc_server();
        this.spawn_rpc_server()
    }
}

exports.RPCInterface = RPCInterface;
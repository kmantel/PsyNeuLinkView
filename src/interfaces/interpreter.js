const path = require('path'),
    fs = require('fs'),
    ifs = require('./filesystem').fileSystemInterface,
    os = require('os'),
    compareVersions = require('compare-versions'),
    log = require('electron-log'),
    {spawn, spawnSync, exec, execSync} = require('child_process'),
    isWin = os.platform() === 'win32',
    treekill = require('tree-kill');

class InterpreterInterface{
    constructor(){
        this.validate_interpreter_path = this.validate_interpreter_path.bind(this);
        this.start_server = this.start_server.bind(this);
        this.check_conda = this.check_conda.bind(this);
        this.find_conda_binary = this.find_conda_binary.bind(this);
        this.find_env_name = this.find_env_name.bind(this);
        this.construct_prefix = this.construct_prefix.bind(this);
        this.execute_validation_script = this.execute_validation_script.bind(this);
        this.spawn_rpc_server = this.spawn_rpc_server.bind(this);
        this.kill_rpc_server = this.kill_rpc_server.bind(this);
        this.restart_rpc_server = this.restart_rpc_server.bind(this);
        this.child_procs = [];
    }

    get_child_procs(){
        return this.child_procs
    }

    start_server(prefix = '', interpreter_path, callback, errorhandler) {
        var callback = callback,
            config = ifs.get_config(),
            pnl_path = config['Python']['PsyNeuLink Path'],
            self = this;
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
                        `"${path.join(__dirname, '..', 'py', 'rpc_server.py')}"`,
                        `"${pnl_path}"`
                    ]
                ]
            }`
        );
        var child_proc = spawn(prefix + interpreter_path,
            [
                '-u -W ignore',
                `"${path.join(__dirname, '..', 'py', 'rpc_server.py')}"`,
                `"${pnl_path}"`
            ],
            {
                shell: true,
                detached: !isWin
            }
        );

        child_proc.on('error', function (err) {
            log.debug('py stdout:' + err)
        });
        child_proc.stdout.setEncoding('utf8');
        child_proc.stdout.on('data', function (data) {
            if (data.trim() === 'PYTHON SERVER READY'){
                if (callback){
                    log.debug('py stdout:' + data);
                    callback()
                }
            }
        });
        child_proc.stderr.setEncoding('utf8');
        child_proc.stderr.on('data', function (data) {
            if (errorhandler){
                errorhandler()
            }
            log.debug('py stderr:' + data);
        });
        this.child_proc = child_proc
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

    execute_validation_script(prefix = '', interpreter_path, callback){
        var config = ifs.get_config();
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
                        `${path.join(__dirname, 'py', 'validate_interpreter.py')}`,
                        `${pnl_path}`
                    ]
                ]
            }`
        );

        var launch_interpreter_validater_cmd = `${prefix} "${interpreter_path}" -u "${path.join(__dirname, '..', 'py', 'validate_interpreter.py')}" "${pnl_path}"`;
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

    spawn_rpc_server(callback, errorhandler) {
        var config = ifs.get_config();
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

exports.interpreterInterface = new InterpreterInterface();
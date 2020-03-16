const path = require('path'),
    os = require('os'),
    fs = require('fs'),
    isWin = os.platform() === 'win32',
    _ = require('lodash');

class FileSystemInterface {
    constructor() {
        this.filewatchers = {}
    }

    /**
     * Adds filepath to watched files. Watched files execute callback when changes to them occur.
     *
     * NOTE: due to a known issue causing fs.watch to emit multiple change events, we have to debounce the callback.
     * It's still possible that the callback could fire twice if the change events are registered by the watch API
     * with a duration between them greater than the wait value set below.
     *
     * For more information on the issues with the watch api, see here: https://github.com/nodejs/node-v0.x-archive/issues/1970
     *
     * @param {string} filepath - path to file that should be watched.
     * @param {function} callback - function that describes actions to take when change occurs in file.
     * */
    watch(filepath, callback = (e)=>{}) {
        if (filepath.startsWith('~')) {
            filepath = path.join(os.homedir(), filepath.slice(1, filepath.length))
        }
        if (filepath in this.filewatchers) {
            this.filewatchers[filepath].close()
        }
        this.filewatchers[filepath] = fs.watch(filepath, _.debounce(callback, 50))
    }

    /**
     * Synchronously writes content (string or object) to filepath. If content is an object, first JSONifies content,
     * then writes to filepath.
     *
     * @param {string} filepath - path to file that should be written to.
     * @param {string, object} content - content that should be written to file.
     */
    write(filepath, content) {
        var writeToFile;
        if (filepath.startsWith('~')) {
            filepath = path.join(os.homedir(), filepath.slice(1, filepath.length))
        }
        if (typeof content === 'object' && content !== null) {
            writeToFile = JSON.stringify(content);
        } else if (typeof content === 'string' || content instanceof String) {
            writeToFile = content;
        }
        fs.writeFileSync(filepath, writeToFile, () => {
            window.dispatchEvent('write')
        })
    }

    /**
     * Synchronously reads a file and returns a copy of its contents.
     *
     * @param {string} filepath - path to file that should be read.
     */
    read(filepath) {
        if (filepath.startsWith('~')) {
            filepath = path.join(os.homedir(), filepath.slice(1, filepath.length))
        }
        return fs.readFileSync(filepath,  {encoding: "utf-8"});
    }

    /**
     * Returns the system-dependent path of the PsyNeuLinkView config file
     */
    get_config_path(){
        var config_filedir,
            config_filepath;
        isWin ?
            config_filedir = path.join(os.homedir(), 'AppData', 'Roaming', 'PsyNeuLinkView')
            :
            config_filedir = path.join(os.homedir(), 'Library', 'Preferences', 'PsyNeuLinkView');
        config_filepath = path.join(config_filedir, 'config.json');
        return config_filepath
    }

    /**
     * Convenience method that returns an object containing the PsyNeuLinkView config file
     */
    get_config(){
        return JSON.parse(this.read(this.get_config_path()));
    }

    /**
     * Convenience method that writes an object to the PsyNeuLinkView config file
     */
    set_config(content){
        var writeToFile = Object.assign({}, content);
        if (typeof content === 'string' || content instanceof String) {
            writeToFile = JSON.parse(content);
        }
        this.write(this.get_config_path(), writeToFile);
    }

    /**
     * Loads config file from local environment. Makes one if one does not exist. If one does exist, but is missing
     * keys that are present in the config_template file, the missing keys are copied to the local config file.
     */
    initialize_config() {
        function keyCopy(template_obj, user_obj) {
            Object.keys(template_obj).forEach(
                (key) => {
                    if (!(key in user_obj)) {
                        user_obj[key] = {...template_obj[key]};
                    }
                }
            );
            Object.keys(template_obj).forEach(
                (key) => {
                    keyCopy(template_obj[key], user_obj[key])
                }
            );
            return user_obj
        }
        var config_path = this.get_config_path(),
            config_dir = path.join(config_path, '..');
        if (!fs.existsSync(this.get_config_path())){
            if (!fs.existsSync(config_dir)){
                fs.mkdirSync(config_dir)
            }
            this.set_config({})
        }
        var config = this.get_config(),
            config_template = JSON.parse(this.read(path.join(__dirname ,'../resources/config_template.json'))),
            config = keyCopy(config_template, config)
        this.set_config(config)
    }
}

exports.fileSystemInterface = new FileSystemInterface();
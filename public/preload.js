const path = require('path');
const remote = require('electron').remote;
const electron_root = remote.require('./electron');
const dialog = remote.dialog;

window.dialog = dialog;
window.isDev = electron_root.isDev;
var modulePath;
if (window.isDev) {
    modulePath = ''
}
else {
    modulePath = path.join(electron_root.app_path,'../app.asar/node_modules');
}

window.getCurrentWindow = remote.getCurrentWindow;
window.modulePath = modulePath;
window.electron_root = electron_root;

var config_client_script = remote.require(path.join(electron_root.app_path, 'src/utility/config/config_client'));
var config_client_obj = new config_client_script.ConfigClient(electron_root.config_filepath);

window.remote = remote;
window.rpc = remote.require(path.join(electron_root.app_path, 'src/utility/rpc/rpc_client'));
window.config_client = config_client_obj;

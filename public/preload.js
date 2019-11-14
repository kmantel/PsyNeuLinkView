const path = require('path');
const electron_root = require('electron').remote.require('./electron');

window.isDev = electron_root.isDev;
var modulePath;
if (window.isDev) {
    modulePath = ''
}
else {
    modulePath = path.join(electron_root.app_path,'../app.asar/node_modules');
}
window.modulePath = modulePath;
window.electron_root = electron_root;

var config_client_script = require('electron').remote.require(path.join(electron_root.app_path, 'src/utility/config/config_client'));
var config_client_obj = new config_client_script.ConfigClient(path.join(electron_root.app_path, 'config.json'));

window.rpc = require('electron').remote.require(path.join(electron_root.app_path, 'src/utility/rpc/rpc_client'));
window.config_client = config_client_obj;

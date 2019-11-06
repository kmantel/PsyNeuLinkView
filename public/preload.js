const path = require('path');
const app_path = require('electron').app_path;
const electron_root = require('electron').remote.require('./electron');

window.electron_root = electron_root;

var config_client_script = require('electron').remote.require(path.join(electron_root.app_path, 'src/utility/config/config_client'));
var config_client_obj = new config_client_script.ConfigClient(path.join(electron_root.app_path, 'config.json'));

window.rpc = require('electron').remote.require(path.join(electron_root.app_path, 'src/utility/rpc/rpc_client'));
window.config_client = config_client_obj;

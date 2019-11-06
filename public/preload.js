const path = require('path');
const app_path = require('electron').app_path;
const electron_root = require('electron').remote.require('./electron');

window.electron_root = electron_root;

window.rpc = require('electron').remote.require(path.join(electron_root.app_path, 'src/utility/rpc/rpc_client'));
window.config = require('electron').remote.require(path.join(electron_root.app_path, 'config.json'));
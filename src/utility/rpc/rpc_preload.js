const path = require('path');

window.rpc = require('electron').remote.require(path.join(__dirname,'rpc_client'));
window.electron_root = require('electron').remote.require(path.join(__dirname,'../../../public/electron'));
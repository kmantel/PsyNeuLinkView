const fs = require('fs'),
      remote = require('electron').remote,
      electron_root = remote.require('./electron'),
      dialog = remote.dialog;

window.dialog = dialog;
window.isDev = electron_root.isDev;
window.getCurrentWindow = remote.getCurrentWindow;
window.electron_root = electron_root;
window.remote = remote;
window.fs = fs;
window.interfaces = electron_root.interfaces;
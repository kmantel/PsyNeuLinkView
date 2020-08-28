const remote = require('electron').remote,
      electron_root = remote.require('./electron'),
      dialog = remote.dialog;

window.dialog = dialog;
window.isDev = electron_root.isDev;
window.getCurrentWindow = remote.getCurrentWindow;
window.electron_root = electron_root;
window.windows = electron_root.windows;
window.remote = remote;
window.interfaces = electron_root.interfaces;

window.interfaces.electron.windows = window.windows;
window.interfaces.filesystem.appPath = electron_root.app_path;
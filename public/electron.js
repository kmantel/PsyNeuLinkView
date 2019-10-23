const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const isDev = require('electron-is-dev');
const express = require('express');
const cors = require('cors');

class api {
    constructor() {
        var self = this;
        this.port = 5000;
        this.graph = null;
        this.filepath = null;
        this.instance = express();
        this.instance.use(express.json());
        this.instance.use(cors());
        this.instance.put(
            '/filepath',
            (req, res) => {
                self.filepath = req.body.filepath;
                res.send(self.filepath);
            }
        );
        this.instance.get(
            '/filepath',
            (req, res) => {
                console.log('path', this.filepath);
                res.send(this.filepath)
            }
        );
        this.instance.get('/graph', (req, res) => {
            return res.send(this.graph)
        })
    }

    start() {
        this.instance.listen(this.port);
    }
}

var api_instance = new api();
api_instance.start();

let mainWindow;

function createWindow() {
    const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({width: width, height: height});
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
    mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', function(){
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
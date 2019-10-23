const electron = require('electron');
const express = require('express');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');
const childProcess = require('child_process')

const api = express().listen(5000);

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
        api.close();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
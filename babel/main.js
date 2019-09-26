'use strict';

var _require = require('electron'),
    app = _require.app,
    BrowserWindow = _require.BrowserWindow;

var path = require('path');
var url = require('url');
var Menu = require('electron').Menu;

// global
var win = void 0;

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

function createWindow() {
  win = new BrowserWindow({
    title: 'Icon Generator',
    width: 600,
    height: 500,
    resizable: false,
    icon: __dirname + '/Icon/Icon.icns',
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadURL(url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.on('closed', function () {
    win = null;
  });

  createMenu();
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (win === null) {
    createWindow();
  }
});

function createMenu() {
  var application = {
    label: "Icon Generator",
    submenu: [{
      label: "New",
      accelerator: "Command+N",
      click: function click() {
        if (win === null) {
          createWindow();
        }
      }
    }, {
      type: "separator"
    }, {
      label: "Quit",
      accelerator: "Command+Q",
      click: function click() {
        app.quit();
      }
    }]
  };

  var template = [application];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
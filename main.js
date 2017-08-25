const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const Menu = require('electron').Menu

// global
let win

function createWindow () {
   win = new BrowserWindow({
    title: 'Icon Generator',
    width: 600, 
    height: 500,
    icon: __dirname + '/Icon/Icon.icns'
  })

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
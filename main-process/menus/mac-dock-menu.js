const electron = require('electron')
const app = electron.app
const Menu = electron.Menu
const main = require('../../main.js')

const dockMenu = Menu.buildFromTemplate([
  {"label": 'New Window', "click": () => { main.createWindow() }},
])

app.dock.setMenu(dockMenu)
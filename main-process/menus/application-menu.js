const electron = require('electron')
const BrowserWindow = electron.BrowserWindow
const dialog = electron.dialog  
const Menu = electron.Menu
const app = electron.app
const main = require('../../main.js')

// Export to PDF
const fs = require('fs')
const os = require('os')
const path = require('path')
const shell = electron.shell

function getNameFromPath(filepath) {
    filename = filepath.substring(filepath.lastIndexOf("/") + 1)
    filename = filename.substring(0, filename.lastIndexOf("."))
    return filename
}

const template = [
{
    label: 'File',
    submenu: [
        {
            label: 'New',
            accelerator: 'CmdOrCtrl+n',
            click: function() {
                main.createWindow("")
            }
        }, {
            label: 'Open...',
            accelerator: 'CmdOrCtrl+o',
            click: function() {
                filepaths = dialog.showOpenDialog({
                    filters: [
                        {name: 'Type documents', extensions: ['type']}
                    ],
                    properties: ['openFile']
                })
                
                if (filepaths) {
                    main.createWindow(filepaths[0])
                }
            },
        }, {
            type: 'separator'
        }, {
            label: 'Lukk',
            role: 'close'
        }, {
            label: 'Save',
            accelerator: 'CmdOrCtrl+s',
            click: function() {
                const win = BrowserWindow.getFocusedWindow()
                
                if(main.isFileNew(win.id)) {
                    main.save_as_file()
                } else {
                    win.webContents.send('save')
                }
            }
        }, {
            label: 'Save as...',
            accelerator: 'Shift+CmdOrCtrl+s',
            click: function() {
                main.save_as_file()
            }
        }, {
            type: 'separator'
        }, {
            label: 'Export to PDF',
            accelerator: 'CmdOrCtrl+e',
            click: function() {
                const win = BrowserWindow.getFocusedWindow()
                filepath = main.getFilepath(win.id)
                if(filepath == "") {
                    filenameWithoutExtension = "Untitled"
                } else {
                    filenameWithoutExtension = getNameFromPath(filepath)
                }
                printFileName = filenameWithoutExtension + ".pdf"
                const pdfPath = path.join(os.tmpdir(), printFileName)
                // Use default printing options
                win.webContents.printToPDF({}, function (error, data) {
                  if (error) throw error
                  fs.writeFile(pdfPath, data, function (error) {
                    if (error) {
                      throw error
                    }
                    shell.openExternal('file://' + pdfPath)
                  })
                })
            }
        }, {
            type: 'separator'
        }, {
            label: 'Print',
            accelerator: 'CmdOrCtrl+p',
            click: function() {
                const win = BrowserWindow.getFocusedWindow()
                win.webContents.print()
            }
        }
      ]
},
  {
    label: 'Edit',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'pasteandmatchstyle'},
      {role: 'delete'},
      {role: 'selectall'}
    ]
  },
  {
    label: 'View',
    submenu: [
      {role: 'reload'},
      {role: 'forcereload'},
      {role: 'toggledevtools'},
      {type: 'separator'},
      {role: 'togglefullscreen'}
    ]
  },
  {
    role: 'window',
    submenu: [
      {role: 'minimize'},
      {role: 'close'}
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('https://electron.atom.io') }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  })

  // Edit menu
  template[2].submenu.push(
    {type: 'separator'},
    {
      label: 'Speech',
      submenu: [
        {role: 'startspeaking'},
        {role: 'stopspeaking'}
      ]
    }
  )

  // Window menu
  template[4].submenu = [
    {role: 'close'},
    {role: 'minimize'},
    {role: 'zoom'},
    {type: 'separator'},
    {role: 'front'}
  ]
}

app.on('ready', function () {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})

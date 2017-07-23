const {app, BrowserWindow, dialog} = require('electron')
const path = require('path')
const glob = require('glob')
const url = require('url')
const ipc = require('electron').ipcMain

if (process.mas) app.setName('Type')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
windows = []
filepathForWindows = {} // {<windowID>: <filepath>}
unsavedWindows = {} // {<windowID>: boolean}

var isReady = false
var openfileOnStartup = ""

exports.isFileNew = (winID) => {
    isFileNew = filepathForWindows[winID] == ""
    return isFileNew
}

exports.getFilepath = (winID) => {
    return filepathForWindows[winID]
}

exports.save_as_file = () => {
    // See: https://electron.atom.io/docs/api/dialog/
    const win = BrowserWindow.getFocusedWindow()
    filepath = dialog.showSaveDialog(win, {
        filters: [
            {name: 'Type documents', extensions: ['type']}
        ]
    })
    
    if(filepath) {
        win.webContents.send('set-filepath', filepath)
        win.webContents.send('save')
    }
}

loadMainProcesses()

exports.createWindow = (filepath) => {
    //dialog.showErrorBox("Tries to open filepath:", process.argv[2])
    
    // Create the browser window.
    const win = new BrowserWindow({
        show: false, // Show when everything loaded
        //width: 800,
        width: 1200,
        height: 1131, // A4 ratio if sceen high enough (1131=800*sqrt(2)) 
        minWidth: 300,
        minHeight: 400,
        tabbingIdentifier: "mainGroup", // Open in tabs on macOS 10.12+ // BUG: DOES NOT WORK!
        webPreferences: {
            defaultEncoding: "UTF-8", // Default is ISO-8859-1
            nodeIntegration: true,
            //sandbox: true,
            //preload: 'renderer-process/preload.js',
        }
    })

    windows.push(win)
    filepathForWindows[win.id] = filepath

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))
    
    win.once('ready-to-show', () => {
        
        if(exports.isFileNew(win.id)) {
            win.webContents.send('set-filepath', "")
            unsavedWindows[win.id] = false
            win.setDocumentEdited(false)
        } else {
            win.webContents.send('set-filepath', filepath)
            win.webContents.send('load')
            unsavedWindows[win.id] = false
            win.setDocumentEdited(false)
        }
        
        win.show()
        
        // Open the DevTools.
        // win.webContents.openDevTools()
    })
    
    // Emitted when the window have pressed close.
    // Or beforeunload
    win.on('close', (event) => {
        if(unsavedWindows[win.id] == true) {
            
            buttonClickedIndex = dialog.showMessageBox(win, {
                "type": "question",
                "buttons": ["Save", "Cancel", "Don't save"],
                "defaultId": 0,
                "cancelId": 1,
                "message": "Do you want to save the changes you made in the document?",
                "detail": "Your changes will be lost if you don't save them."
            })
            
            if(buttonClickedIndex == 0) {
                // Save
                event.preventDefault()
                
                if(exports.isFileNew(win.id)) {
                    exports.save_as_file()
                } else {
                    win.webContents.send('save')
                }
            } else if (buttonClickedIndex == 1) {
                // Cancel
                event.preventDefault()
            } else if (buttonClickedIndex == 2){
                // Don't save
                // Do not do anything
            }
        }
    })

    // Emitted when the window is closed.
    win.on('closed', () => {
        const win = BrowserWindow.getFocusedWindow()
        windows.pop(win)
    })
}

ipc.on('file-changed', () => {
    const win = BrowserWindow.getFocusedWindow()
    unsavedWindows[win.id] = true 
    win.setDocumentEdited(true)
})

ipc.on('filepath-changed', (event, filepath) => {
    const win = BrowserWindow.getFocusedWindow()
    filepathForWindows[win.id] = filepath
    win.setRepresentedFilename(filepath)
    
    if(filepath != "") {
        app.addRecentDocument(filepath)
    }
    
})

ipc.on('file-saved', () => {
    const win = BrowserWindow.getFocusedWindow()
    unsavedWindows[win.id] = false
    win.setDocumentEdited(false)
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    isReady = true
    if(process.argv.length > 1 && process.argv[1] != ".") {
        openfileOnStartup = process.argv[1]
    }
    exports.createWindow(openfileOnStartup)
})

// macOS only
app.on('open-file', (event, path) => {
    if(!isReady) {
        openfileOnStartup = path
        // Let ready start the window.
    } else {
        exports.createWindow(path)
    }
})

// macOS only
app.on('new-window-for-tab', function () {
    createWindow("")
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (windows.length == 0) {
        exports.createWindow("")
    }
})

// Require each JS file in the main-process dir
function loadMainProcesses() {
    var files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
    files.forEach(function (file) {
        require(file)
    })
}
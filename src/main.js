const {app, BrowserWindow, dialog} = require('electron');
const path = require('path');
const glob = require('glob');
const url = require('url');
const ipc = require('electron').ipcMain;
const windowStateKeeper = require('electron-window-state');

if (process.mas) app.setName('Type');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let windows = [];
let filepathForWindows = {};  // {<windowID>: <filepath>}
let unsavedWindows = {};  // {<windowID>: boolean}

let isReady = false;
let openfileOnStartup = '';

exports.isFileNew = (winID) => {
  const isFileNew = filepathForWindows[winID] == '';
  return isFileNew;
};

exports.isFileUnsaved = (winID) => {
  return unsavedWindows[winID];
};

exports.getFilepath = (winID) => {
  return filepathForWindows[winID];
};

function getNameFromPath(filepath) {
  let filename = path.basename(filepath);
  filename = filename.substring(0, filename.lastIndexOf('.'));
  return filename;
}

exports.saveAsFile = () => {
  // See: https://electron.atom.io/docs/api/dialog/
  const win = BrowserWindow.getFocusedWindow();
  
  dialog.showSaveDialog(win, {
    filters: [
      {name: 'Type documents', extensions: ['type']}
    ]
  }, filepath => {
    if (filepath) {
      win.webContents.send('set-filepath', filepath);
      win.webContents.send('save');
    }
  });
};

loadMainProcesses();

exports.createWindow = (filepath) => {
  //dialog.showErrorBox('Tries to open filepath:', process.argv[2])
  
  let mainWindowState = windowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 1131  // A4 ratio if sceen high enough (1131=800*sqrt(2)) 
  });
  
  // Create the browser window.
  const win = new BrowserWindow({
    show: false, // Show when everything loaded
    //width: 800,
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height,
    minWidth: 300,
    minHeight: 400,
    tabbingIdentifier: 'mainGroup',  // Open in tabs on macOS 10.12+ // BUG: DOES NOT WORK!
    webPreferences: {
      defaultEncoding: 'UTF-8',  // Default is ISO-8859-1
      nodeIntegration: true,
      //sandbox: true,
      //preload: 'renderer-process/preload.js',
    }
  });
  
  mainWindowState.manage(win);
  windows.push(win);
  filepathForWindows[win.id] = filepath;

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  
  win.once('ready-to-show', () => {
    if (exports.isFileNew(win.id)) {
      //win.webContents.send('set-filepath', '')
      unsavedWindows[win.id] = false;
      win.setDocumentEdited(false);
    } else {
      win.webContents.send('set-filepath', filepath);
      win.webContents.send('load');
      unsavedWindows[win.id] = false;
      win.setDocumentEdited(false);
    }
    
    win.show();
    
    // Open the DevTools.
    // win.webContents.openDevTools()
  });
  
  // Emitted when the window have pressed close.
  // Or beforeunload
  win.on('close', function(event) {
    if (unsavedWindows[win.id] == true) {
      event.preventDefault();
      
      let filename;

      if (filepathForWindows[win.id] == '') {
        filename = 'Untitled';
      } else {
        filename = getNameFromPath(filepathForWindows[win.id]);
      }
      
      const messageBoxOption = {
        type: 'question',
        buttons: ['Save', 'Cancel', 'Don\'t save'],
        defaultId: 0,
        cancelId: 1,
        message: `Do you want to save '${filename}'?`,
        detail: `Your changes will be lost if you don't save them.`
      };
      
      dialog.showMessageBox(win, messageBoxOption, function(buttonClickedIndex) {
        // Save
        if (buttonClickedIndex == 0) {
          if (exports.isFileNew(win.id)) {
            exports.saveAsFile();
          } else {
            win.webContents.send('save');
          }
        
        // Cancel
        } else if (buttonClickedIndex == 1) {
          // Do not do anything
        
        // Don't save
        } else if (buttonClickedIndex == 2){
          win.destroy();
          // Do not do anything
        }
      })
    }
  });

  // Emitted when the window is closed.
  win.on('closed', function() {
      const win = BrowserWindow.getFocusedWindow();
      windows.pop(win);
  });
};

ipc.on('file-changed-status-changed', function(event, isChanged) {
  const win = BrowserWindow.getFocusedWindow();
  unsavedWindows[win.id] = isChanged;
  win.setDocumentEdited(isChanged);
});

ipc.on('filepath-changed', function(event, filepath) {
  const win = BrowserWindow.getFocusedWindow();
  filepathForWindows[win.id] = filepath;
  win.setRepresentedFilename(filepath);
  
  if (filepath != '') {
    app.addRecentDocument(filepath);
  }
});

ipc.on('file-saved', function() {
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  isReady = true;
  if(process.argv.length > 1 && process.argv[1] != '.') {
    openfileOnStartup = process.argv[1];
  }
  exports.createWindow(openfileOnStartup);
});

// macOS only
app.on('open-file', function(event, path) {
  if (!isReady) {
    openfileOnStartup = path;
    // Let ready start the window.
  } else {
    exports.createWindow(path);
  }
});

// macOS only
app.on('new-window-for-tab', function() {
  exports.createWindow('');
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (windows.length == 0) {
    exports.createWindow('');
  }
});

// Require each JS file in the main-process dir
function loadMainProcesses() {
  const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'));
  files.forEach(function (file) {
    require(file);
  })
}

const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog;
const Menu = electron.Menu;
const app = electron.app;
const main = require('../../main.js');

// Export to PDF
const fs = require('fs');
const os = require('os');
const path = require('path');
const shell = electron.shell;

function getNameFromPath(filepath) {
  let filename = path.basename(filepath);
  filename = filename.substring(0, filename.lastIndexOf("."));
  return filename;
}

function newFile() {
  main.createWindow("");
}

function openFile() {
  const oldWin = BrowserWindow.getFocusedWindow()
          
  dialog.showOpenDialog({
    filters: [
      {name: 'Type documents', extensions: ['type']}
    ],
    properties: ['openFile']
  }, (filepaths) => {
    if (filepaths) {
      if (oldWin) {
        const oldWinIsBlank = (main.isFileNew(oldWin.id) && !(main.isFileUnsaved(oldWin.id)));
        if (oldWinIsBlank) {
          oldWin.close();
        }
      }

      main.createWindow(filepaths[0]);
    }
  });
}

function saveFile() {
  const win = BrowserWindow.getFocusedWindow()
  
  if (main.isFileNew(win.id)) {
    main.saveAsFile();
  } else {
    win.webContents.send('save');
  }
}

function saveFileAs() {
  main.saveAsFile();
}

function exportFileToPDF() {
  const win = BrowserWindow.getFocusedWindow();
  filepath = main.getFilepath(win.id);
  
  let filenameWithoutExtension;
  
  if(filepath == "") {
      filenameWithoutExtension = "Untitled";
  } else {
      filenameWithoutExtension = getNameFromPath(filepath);
  }
  
  const printFileName = filenameWithoutExtension + ".pdf";
  const pdfPath = path.join(os.tmpdir(), printFileName);
  
  // Use default printing options
  win.webContents.printToPDF({}, function (error, data) {
    if (error) throw error;
    
    fs.writeFile(pdfPath, data, function (error) {
      if (error) throw error;
      shell.openExternal('file://' + pdfPath);
    });
  });
}

function printFile() {
  const win = BrowserWindow.getFocusedWindow();
  win.webContents.print();
}

function openApplicationWebsite() {
  require('electron').shell.openExternal('https://github.com/jontingvold/type-text-processor');
}

const template = [
  {
    label: 'File',
    submenu: [
      { label: 'New', accelerator: 'CmdOrCtrl+n', click: newFile }, 
      { label: 'Open...', accelerator: 'CmdOrCtrl+o', click: openFile }, 
      { label: 'Lukk', role: 'close'}, 
      { type: 'separator'},
      
      { label: 'Save', accelerator: 'CmdOrCtrl+s', click: saveFile }, 
      { label: 'Save as...', accelerator: 'Shift+CmdOrCtrl+s', click: saveFileAs }, 
      { type: 'separator'},
      
      { label: 'Export to PDF', accelerator: 'CmdOrCtrl+e', click: exportFileToPDF }, 
      { label: 'Print', accelerator: 'CmdOrCtrl+p', click: printFile }
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
      { label: 'Type Website', click: openApplicationWebsite }
    ]
  }
];

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
  });

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
  );

  // Window menu
  template[4].submenu = [
    {role: 'close'},
    {role: 'minimize'},
    {role: 'zoom'},
    {type: 'separator'},
    {role: 'front'}
  ];
}

app.on('ready', function () {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});

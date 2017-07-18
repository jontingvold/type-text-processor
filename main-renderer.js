const ipc = require('electron').ipcRenderer
const fs = require('fs')

var thisDocument = null
var trixEditor = null
var filepath = ""

function getNameFromPath(filepath) {
    filename = filepath.substring(filepath.lastIndexOf("/") + 1)
    filename = filename.substring(0, filename.lastIndexOf("."))
    return filename
}

ipc.on('set-filepath', function (event, new_filepath) {
    if(filepath != new_filepath) {
        filepath = new_filepath
        ipc.send('filepath-changed', filepath)
        
        // Update window title
        if(filepath == "") {
            thisDocument.title = "Untitled"
        } else {
            filename = getNameFromPath(filepath)
            thisDocument.title = filename
        }
    } 
})

ipc.on('load', function (event) {
    load_file()
})

ipc.on('save', function (event) {
    save_file()
})


function load_file() {
    fs.readFile(filepath, 'utf8', function (err, data) {
      if (err) {
          return console.log(err);
      }
      
      // If success
      trixEditor.editor.loadJSON(JSON.parse(data))
    });
}

function save_file() {
    data = JSON.stringify(trixEditor.editor)
    
    fs.writeFile(filepath, data, function(err) {
       if(err) {
           return console.log(err);
       }
       
       ipc.send('file-saved')
    });
}

// Make available to global scope
exports.setup = function(doc, aTrixEditor) {
    thisDocument = doc
    trixEditor = aTrixEditor
    
    trixEditor.editor.setSelectedRange([0, 0])
    
    trixEditor.addEventListener('trix-change', function() {
    	ipc.send('file-changed')
    })
}
const ipc = require('electron').ipcRenderer;
const fs = require('fs');
const path = require('path');

var thisDocument = null;
var trixElement = null;
var fileAtLastSave = '';
var filepath = '';

function getNameFromPath(filepath) {
  let filename = path.basename(filepath);
  filename = filename.substring(0, filename.lastIndexOf('.'));
  return filename;
}

ipc.on('set-filepath', function(event, new_filepath) {
  console.log('SET FILEPATH:');
  console.log(new_filepath);

  if (filepath != new_filepath) {
    filepath = new_filepath;
    ipc.send('filepath-changed', filepath);

    // Update window title
    if (filepath == '') {
      thisDocument.title = 'Untitled';
    } else {
      let filename = getNameFromPath(filepath);
      thisDocument.title = filename;
    }
  }
});

ipc.on('load', function(event) {
  load_file();
});

ipc.on('save', function(event) {
  save_file();
});


function load_file() {
  fs.readFile(filepath, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }

    // If success
    trixElement.value = data;

    fileAtLastSave = trixElement.value;
    update_changed_status();
  });
}

function save_file() {
  data = trixElement.value;

  fileAtLastSave = trixElement.value;
  update_changed_status();

  fs.writeFile(filepath, data, function(err) {
    if (err) {
      return console.log(err);
    }

    ipc.send('file-saved');
  });
}

function update_changed_status() {
  const haveChangedSinceLastSave = (fileAtLastSave != trixElement.value);
  ipc.send('file-changed-status-changed', haveChangedSinceLastSave);
}

setup = function(doc, trixElem) {
  thisDocument = doc;
  trixElement = trixElem;
  trixElement.addEventListener('trix-change', function() {
    update_changed_status();
  });
};
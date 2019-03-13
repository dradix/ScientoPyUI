const { ipcRenderer } = require('electron');
const SetPathButton = document.querySelector('#set-path');
SetPathButton.addEventListener('click', (event) => {
    ipcRenderer.send('open-file-dialog')
});
//Callback for databse path selected
ipcRenderer.on('selected-directory', (event, path) => {
    console.log(path);
    if (path[0] != null) {
        document.getElementById('database-path').value = path[0];
    }

})
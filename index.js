const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain, dialog,event } = electron;
let MainWindow;

// Callback for app ready
app.on('ready', function () {
    MainWindow = new BrowserWindow();
    MainWindow.setSimpleFullScreen(true);
    MainWindow.loadURL(url.format(
        {
            pathname: path.join(__dirname, 'html', 'main_window.html'),
            protocol: 'file:',
            slashes: true
        }));
    const MainMenu = Menu.buildFromTemplate(MainMenuTemplate);
    MainWindow.setMenu(MainMenu);
});
//End App ready

const MainMenuTemplate = [
    {
        label: 'File',
        submenu:[
            {
                label:'Start New Analysis'
            },         
            {
                label:"Quit",
                click(){
                    app.quit();
                },
                //TODO: Support Linux and Mac
                accelerator: "Control+Q"
            },
        ]
    },
    {
        label: 'Debug',
        submenu: [
            {
                label: "Open Developer Tools",
                accelerator: "Control+Shift+I",
                click() {
                    MainWindow.webContents.openDevTools();
                }
            }
        ]
    }
];


// Event listeners

ipcMain.on('open-file-dialog', (event) => {
    dialog.showOpenDialog(
        {
            properties: ['openFile', 'openDirectory']
        },
        (files) => {
            if (files) {
                      
                MainWindow.webContents.send('selected-directory', files);
            }
        });
});
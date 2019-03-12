const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu } = electron;
let MainWindow;

// Callback for app ready
app.on('ready', function () {
    MainWindow = new BrowserWindow();
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
                label:'Start new analysis'
            },
            {
                label:"Quit",
                click(){
                    app.quit();
                },
                //TODO: Support Linux and Mac
                accelerator: "Control+Q"
            }
        ]
    }
];
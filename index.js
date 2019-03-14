const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const {PythonShell} = require('python-shell');
const { app, BrowserWindow, Menu, ipcMain, dialog } = electron;

let MainWindow;
let PyShell 
let CurrentDatabasePath;
let DOCUMENTS_PATH;
// Callback for app ready
app.on('ready', function () {
    MainWindow = new BrowserWindow({ width: 1280, height: 800, frame: false });
    //MainWindow.setSimpleFullScreen(true);
    
    MainWindow.loadURL(url.format(
        {
            pathname: path.join(__dirname, 'html', 'main_window.html'),
            protocol: 'file:',
            slashes: true
        }));
    const MainMenu = Menu.buildFromTemplate(MainMenuTemplate);
    MainWindow.setMenu(MainMenu);
    let options = {
        mode: 'text',
        pythonOptions: ['-u'], // get print results in real-time          
      };

    //Create directories
    DOCUMENTS_PATH = path.join(app.getPath('documents'),'ScientoPy');
    if (!fs.existsSync(DOCUMENTS_PATH)) {
        fs.mkdir(DOCUMENTS_PATH, function () {
            console.log("Error creating folder");
        });
    }

    
    //python callbacks
    PyShell = new PythonShell(path.join(app.getAppPath(),'python','task.py'),options);
    let i = 0;
    PyShell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        console.log(message);

     
      });
      
});


//function HandleResponse()
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
                CurrentDatabasePath = files[0];

            }
        });
});

ipcMain.on('start-preprocess', function (event) {    

    if (CurrentDatabasePath == undefined) {
        ShowSimpleInfoDialog("You must select a database path")
        return;
    }
    
    CallPythonTask('preprocess', [CurrentDatabasePath, '--savePlot','preProcessed.eps','--intermediateFolder',DOCUMENTS_PATH]);

});

function CallPythonTask(Command, Args){
    
    PyShell.send(JSON.stringify({ command: Command, args: Args }));
}


function ShowSimpleInfoDialog(Message,Title = 'Alert')
{
    const options ={
        type:'info',
        title: Title,
        message : Message,
        buttons: ['OK']
    };
    dialog.showMessageBox(options,null);
}
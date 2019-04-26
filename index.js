const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const { PythonShell } = require('python-shell');
const { app, BrowserWindow, Menu, ipcMain, dialog } = electron;

let MainWindow;
let AnalysisWindow;
let PyShell
let CurrentDatabasePath;
let DOCUMENTS_PATH;
let PYTHON_PATH = 'C:\\Users\\jejho\\AppData\\Local\\Programs\\Python\\Python37-32\\python'

let CurrentProjectName;
// Callback for app ready
app.on('ready', function () {
    //Setup Main Window
    MainWindow = new BrowserWindow({ width: 1280, height: 800 });
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
        pythonPath:  PYTHON_PATH,
        pythonOptions: ['-u'], // get print results in real-time          
    };
    MainWindow.on('close', function () {
        MainWindow = null
        if (AnalysisWindow) {
            AnalysisWindow.close();
        }

    })

    //Create directories
    DOCUMENTS_PATH = path.join(app.getPath('documents'), 'ScientoPy');
    if (!fs.existsSync(DOCUMENTS_PATH)) {
        fs.mkdir(DOCUMENTS_PATH, function () {
            console.log("Error creating folder");
        });
    }


    //python callbacks
    PyShell = new PythonShell(path.join(app.getAppPath(), 'python', 'task.py'), options);
    let i = 0;
    PyShell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        console.log(message);
        HandleResponse(message);

    });

});
function HandleResponse(Response) {
    try {
        ResponseData = JSON.parse(Response);
    } catch (e) {
        return;
    }

    switch (ResponseData['command']) {
        case 'preprocess':
            StartNewAnalysisWindow();
            break;
        case 'refresh-preprocess':
            RefreshPreprocessedData();
            break;
        case 'sciento-analiyze':
            RefreshAnalyzedData();
        break;
        default:
            console.log('Invalid response');
            break;
    }


}
function RefreshPreprocessedData()
{
    if(AnalysisWindow)
    {
        AnalysisWindow.webContents.send('refresh-preprocessed-data');
    }
}

function RefreshAnalyzedData()
{
    if(AnalysisWindow)
    {
        AnalysisWindow.webContents.send('refresh-analyzed-data');
    }
}
function StartNewAnalysisWindow() {
    AnalysisWindow = new BrowserWindow({ width: 1280, height: 800 });
    //MainWindow.setSimpleFullScreen(true);

    AnalysisWindow.loadURL(url.format(
        {
            pathname: path.join(__dirname, 'html', 'analysis_window.html'),
            protocol: 'file:',
            slashes: true
        }));
    AnalysisWindow.on('close', function () { AnalysisWindow = null })

    AnalysisWindow.webContents.on('did-finish-load', () => {
        AnalysisWindow.webContents.send('project-data', CurrentDatabasePath,CurrentProjectName,DOCUMENTS_PATH);
    });
    GetSummaryData();
    AnalysisWindow.show();

}
function tsvJSON(tsv) {

    var lines = tsv.split("\n");

    var result = [];

    var headers = lines[0].split("\t");

    for (var i = 1; i < lines.length; i++) {

        var obj = {};
        var currentline = lines[i].split("\t");

        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);

    }

    //return result; //JavaScript object
    return JSON.stringify(result); //JSON
}
function GetSummaryData() {
    fs.readFile( path.join(DOCUMENTS_PATH,'dataPre','PreprocessedBrief.tsv'), 'utf-8', (err, data) => {
        if (err) {
            alert("An error ocurred reading the file :" + err.message);
            return;
        }

        // Change how to handle the file content
        console.log("The file content is : " + data);
        console.log(tsvJSON(data));
        //AnalysisWindow.webContents.send('summary-data');

    });
    let Data = { TotalLoaderPapers: 0, DuplicatedPapersFound: 0, WoSPapers: 0, ScopusPapers: 0, UniquePapers: 0 };
}
//End App ready

const MainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Start New Analysis'
            },
            {
                label: "Quit",
                click() {
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
            },
            {
                label: "Analysis window test",                
                click() {
                    StartNewAnalysisWindow();
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

ipcMain.on('start-preprocess', function (event, Path,ProjectName) {

    console.log("path: " + Path);
    console.log("name: " + ProjectName);
    if (Path == undefined || Path==="") {
        ShowSimpleInfoDialog("You must select a database path")
        return;
    }
    if (ProjectName == undefined||ProjectName==="") {
        ShowSimpleInfoDialog("You must provide a project name")
        return;
    }

    CurrentProjectName = ProjectName;
    CurrentDatabasePath = Path;
    CallPythonTask('preprocess', [Path, '--intermediateFolder', DOCUMENTS_PATH, '--savePlot','preProcessed.svg']);

});


//Entry point for running preprocessing again with new arguments
ipcMain.on('refresh-preprocess', function (event, Path, RemoveDuplicates) {

    let ArgList =  [Path, '--intermediateFolder', DOCUMENTS_PATH, '--savePlot', 'preProcessed.svg'];
    if(!RemoveDuplicates)
    {
        ArgList.push('--noRemDupl');
    }
    CallPythonTask('refresh-preprocess',ArgList);
});
//Entry point for running preprocessing again with new arguments
ipcMain.on('run-analysis', function (event, Path, Criterion,GraphType,StartYear,EndYear,YearWidth,Trend,YLog,PYear) {

    let ArgList =  [ '--intermediateFolder', DOCUMENTS_PATH,
    Criterion, 
    '--savePlot', 'analysis.svg',     
     '--'+GraphType,
     '--startYear',StartYear,
     '--endYear',EndYear,
     '--windowWidth',YearWidth   
    ];
    if(Trend)
    {
        ArgList.push('--trend');
    }
    if(YLog)
    {
        ArgList.push('--yLog');
    }
    if(PYear)
    {
        ArgList.push('--pYear');
    }
    CallPythonTask('sciento-analiyze',ArgList);
});


function CallPythonTask(Command, Args) {

    PyShell.send(JSON.stringify({ command: Command, args: Args }));
}


function ShowSimpleInfoDialog(Message, Title = 'Alert') {
    const options = {
        type: 'info',
        title: Title,
        message: Message,
        buttons: ['OK']
    };
    dialog.showMessageBox(options, null);
}
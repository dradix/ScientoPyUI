const { ipcRenderer} = require('electron');
window.Bootstrap = require('bootstrap');
const ProjectListContainer = document.querySelector('#project-list');
const PreProcessedImage = document.querySelector('#pre-processed-image');
const PreProcessedLabel = document.querySelector('#pre-processed-label');
const AnalyzedImage = document.querySelector('#analysis-image');
const AnalyzedLabel = document.querySelector('#analysis-label');
const PreprocessForm = document.querySelector('#pre-process-form');
const ExportButton = document.querySelector('#export-button');
const AnalysisForm = document.querySelector('#analysis-form');
let CurrentIntermediate;
let CurrentPath;

//Callback for initial project data
ipcRenderer.on('project-data', (event, Path, ProjectName, IntermediateFolder, SummaryData) => {
    ProjectListContainer.innerHTML = '<a class="project-item-active project-item" id="v-pills-home-tab"> 1.' + ProjectName + '</a>';
    let d = new Date();   
    CurrentIntermediate = IntermediateFolder;
    PreProcessedImage.src = CurrentIntermediate+'\\graphs\\preProcessed.svg'+'?a'+d.getTime();
    PreProcessedLabel.innerHTML = "Reprocessed data for "+ ProjectName;
    CurrentPath=Path;
    
})

//Export button callback
ExportButton.addEventListener('click', (event) => {
    event.preventDefault();
    ipcRenderer.send('export-graph-click', GetValueFromInput('#graph-extension'));
});


// Call for run preprocess python command again with new arguments
PreprocessForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const RemoveDuplicatesCheck = document.querySelector('#remove-duplicates-check');
    const StartYearInput = document.querySelector('#start-year');
    const EndYearInput = document.querySelector('#end-year');
    console.log(CurrentPath,StartYearInput.value,EndYearInput.value,RemoveDuplicatesCheck.value);

    ipcRenderer.send('refresh-preprocess',CurrentPath,RemoveDuplicatesCheck.checked);
});

//Callback for initial project data
ipcRenderer.on('refresh-preprocessed-data', (event) => {    
    let d = new Date();  
    PreProcessedImage.src=CurrentIntermediate+'\\graphs\\preProcessed.svg'+'?a'+d.getTime();
})

//Callback for export graph
ipcRenderer.on('export-request', (event,File) => {    
    ipcRenderer.send('export-graph',
    CurrentPath,
    GetValueFromInput('#criterion'),
    GetValueFromInput('#graph-type'),
    GetValueFromInput('#start-year'),
    GetValueFromInput('#end-year'),
    GetValueFromInput('#year-width'),
    GetCheckedFromInput('#trend'),
    GetCheckedFromInput('#yLog'),
    GetCheckedFromInput('#onlyFirst'),    
    GetValueFromInput('#length'),    
    GetValueFromInput('#topics'),
    GetValueFromInput('#graphTitle'),
    GetCheckedFromInput('#previousResults'),
    File,
    false
    );
})

//Callback for initial project data
ipcRenderer.on('refresh-analyzed-data', (event) => {    
    let d = new Date();  
    AnalyzedImage.src=CurrentIntermediate+'\\graphs\\analysis.svg'+'?a'+d.getTime();
    AnalyzedImage.hidden=false;
})

// Call for run preprocess python command again with new arguments
AnalysisForm.addEventListener("submit", (event) => {
    event.preventDefault();
    ipcRenderer.send('run-analysis',
    CurrentPath,
    GetValueFromInput('#criterion'),
    GetValueFromInput('#graph-type'),
    GetValueFromInput('#start-year'),
    GetValueFromInput('#end-year'),
    GetValueFromInput('#year-width'),
    GetCheckedFromInput('#trend'),
    GetCheckedFromInput('#yLog'),
    GetCheckedFromInput('#onlyFirst'),    
    GetValueFromInput('#length'),    
    GetValueFromInput('#topics'),
    GetValueFromInput('#graphTitle'),
    GetCheckedFromInput('#previousResults'),
    false
    );
});

function GetValueFromInput(QuerySelector)
{
    return document.querySelector(QuerySelector).value;
}

function GetCheckedFromInput(QuerySelector)
{
    return document.querySelector(QuerySelector).checked;
}
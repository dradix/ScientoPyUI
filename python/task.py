import sys, json,subprocess,os
#PATH_TO_SCIENTOPY = os.path.join(os.getcwd(),"python","core","ScientoPy")
PATH_TO_SCIENTOPY = os.getcwd()+"\\python\\core\\ScientoPy\\"
PYTHON_PATH = sys.executable
PREPROCESS = "preProcess.py"
SCIENTOPY = "scientoPy.py"

#the command to execute

# simple JSON echo script
for line in sys.stdin:
    CmdList = list()  
    CmdOut= dict()  
    JsonData = json.loads(line)
    if "command" not in JsonData:
        print("Error command")
        quit()

    print("Executing " + JsonData["command"])

    #assign a file for the command
    if JsonData["command"] == "preprocess":
        CmdList.extend([PYTHON_PATH, PATH_TO_SCIENTOPY+PREPROCESS])
    if JsonData["command"] == "refresh-preprocess":
        CmdList.extend([PYTHON_PATH, PATH_TO_SCIENTOPY+PREPROCESS])
    if JsonData["command"] == "sciento-analiyze":
        CmdList.extend([PYTHON_PATH, PATH_TO_SCIENTOPY+SCIENTOPY])
        
    CmdList.extend(JsonData["args"])
    print(CmdList)
    subprocess.run(CmdList, shell=True, check=True)
    CmdOut["command"]=JsonData["command"]
    print(json.dumps(CmdOut)) 

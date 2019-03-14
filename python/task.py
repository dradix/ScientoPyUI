import sys, json,subprocess,os
PATH_TO_SCIENTOPY = os.getcwd()+"\\python\\core\\ScientoPy\\"

PREPROCESS = "preProcess.py"

#the command to execute

# simple JSON echo script
for line in sys.stdin:
    CmdList = list()
    JsonData = json.loads(line)
    if "command" not in JsonData:
        print("Error command")
        quit()

    print("Executing " + JsonData["command"])

    #assign a file for the command
    if JsonData["command"] == "preprocess":
        CmdList.extend(["python", PATH_TO_SCIENTOPY+PREPROCESS])

    CmdList.extend(JsonData["args"])
    print(CmdList)
    subprocess.run(CmdList, shell=True, check=True) 

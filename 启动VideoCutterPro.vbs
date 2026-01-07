Dim objShell, objFSO
Dim strScriptPath, strScriptDir

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

strScriptPath = WScript.ScriptFullName
strScriptDir = objFSO.GetParentFolderName(strScriptPath)

objShell.CurrentDirectory = strScriptDir

objShell.Run "cmd /c npm start", 0, False
Set shell = CreateObject("WScript.Shell")
repo = "C:\Users\acost\flop stack\flop-session-router"
cmd = "cmd.exe /c cd /d """ & repo & """ && npm run inference:serve >> inference-gateway.log 2>&1"
shell.Run cmd, 0, False

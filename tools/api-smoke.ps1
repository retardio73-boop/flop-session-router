$body = Get-Content -Raw "$PSScriptRoot\gateway-api-smoke.json"
$response = Invoke-RestMethod -Uri "http://127.0.0.1:8790/v1/chat/completions" -Method Post -ContentType "application/json" -Body $body
$response | ConvertTo-Json -Depth 8

$repo = Split-Path -Parent $PSScriptRoot
$pidFile = Join-Path $repo ".inference-gateway.pid"
if (-not (Test-Path $pidFile)) { Write-Output "not-running"; exit 0 }
$targetPid = [int](Get-Content -Raw $pidFile)
$process = Get-Process -Id $targetPid -ErrorAction SilentlyContinue
if ($process) {
  Stop-Process -Id $targetPid -Force
  Write-Output "stopped:$targetPid"
} else {
  Write-Output "stale-pid:$targetPid"
}
Remove-Item $pidFile -Force -ErrorAction SilentlyContinue

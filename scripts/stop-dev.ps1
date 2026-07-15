$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$RunDir = Join-Path $ProjectRoot ".local-run"
$PidPath = Join-Path $RunDir "dev.pid"
$Port = 3001

$listeners = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
  Where-Object { $_.State -eq "Listen" }

if (-not $listeners) {
  if (Test-Path $PidPath) {
    Remove-Item -LiteralPath $PidPath -Force
  }
  Write-Host "No dev server is listening on port $Port."
  exit 0
}

$pids = $listeners | Select-Object -ExpandProperty OwningProcess -Unique

foreach ($pidValue in $pids) {
  Stop-Process -Id $pidValue -Force -ErrorAction SilentlyContinue
  Write-Host "Stopped dev server process PID $pidValue."
}

if (Test-Path $PidPath) {
  Remove-Item -LiteralPath $PidPath -Force
}

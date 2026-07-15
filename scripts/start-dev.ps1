$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$RunDir = Join-Path $ProjectRoot ".local-run"
$LogPath = Join-Path $RunDir "dev.log"
$PidPath = Join-Path $RunDir "dev.pid"
$Port = 3001

New-Item -ItemType Directory -Force -Path $RunDir | Out-Null

$existing = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
  Where-Object { $_.State -eq "Listen" } |
  Select-Object -First 1

if ($existing) {
  $existing.OwningProcess | Set-Content -Path $PidPath -Encoding ascii
  Write-Host "Dev server already running: http://127.0.0.1:$Port (PID $($existing.OwningProcess))"
  exit 0
}

if (Test-Path $LogPath) {
  Remove-Item -LiteralPath $LogPath -Force
}

$command = "cd /d `"$ProjectRoot`" && npm.cmd run dev > `"$LogPath`" 2>&1"
$process = Start-Process -FilePath "cmd.exe" `
  -ArgumentList @("/d", "/s", "/c", $command) `
  -WindowStyle Hidden `
  -PassThru

$process.Id | Set-Content -Path $PidPath -Encoding ascii

for ($i = 0; $i -lt 40; $i++) {
  Start-Sleep -Milliseconds 500
  $listener = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
    Where-Object { $_.State -eq "Listen" } |
    Select-Object -First 1

  if ($listener) {
    $listener.OwningProcess | Set-Content -Path $PidPath -Encoding ascii
    Write-Host "Dev server running: http://127.0.0.1:$Port (PID $($listener.OwningProcess))"
    Write-Host "Log: $LogPath"
    exit 0
  }
}

Write-Host "Dev server did not become ready in time. Check log: $LogPath"
exit 1

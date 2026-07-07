param(
  [string]$OutputRoot = "release-data\v3.0-samples",
  [string]$MirrorPrefix = "",
  [string]$Proxy = "",
  [switch]$SkipExtract
)

$ErrorActionPreference = "Stop"

$releaseBase = "https://github.com/Renhuai123/ziwei-doushu/releases/download/v3.0-samples"
$assets = @(
  @{
    Name = "SHA256SUMS.txt"
    Size = 918
    Sha256 = ""
  },
  @{
    Name = "speed-test.txt"
    Size = 30
    Sha256 = ""
  },
  @{
    Name = "ziwei-samples-v3-part1.zip.001"
    Size = 1992294400
    Sha256 = "424b90ff4ef3cf67db0643515b3c62251f15bdb3cadd3b1414418e762c1c9369"
  },
  @{
    Name = "ziwei-samples-v3-part2.zip.002"
    Size = 1992294400
    Sha256 = "4a32ad023e265b5d6edc19fcb67752971333e5a822b5793c778cbb5f895a2bdf"
  },
  @{
    Name = "ziwei-samples-v3-part3.zip.003"
    Size = 1893639808
    Sha256 = "9628d6633123a78f67df4b9b3d49abfccfea72f8cdb936cd7bea24cdee89787e"
  }
)
$combinedName = "ziwei-samples-toolkit-v3-full-20260425.zip"
$combinedSha256 = "21fe90f8737931c63397f38e419bbba6e839b7f8318440ccb747f9bb3e9b1870"

function Resolve-AssetUrl([string]$name) {
  $url = "$releaseBase/$name"
  if ([string]::IsNullOrWhiteSpace($MirrorPrefix)) {
    return $url
  }
  return "$MirrorPrefix$url"
}

function Invoke-CurlDownload([string]$url, [string]$outputPath) {
  $curl = "curl.exe"
  $args = Get-CurlArgs $url $outputPath
  & $curl @args
  if ($LASTEXITCODE -ne 0) {
    throw "Download failed: $url"
  }
}

function Get-CurlArgs([string]$url, [string]$outputPath) {
  $args = @(
    "--http1.1",
    "--ssl-no-revoke",
    "--location",
    "--fail",
    "--retry", "8",
    "--retry-delay", "3",
    "--connect-timeout", "30",
    "--continue-at", "-",
    "--output", $outputPath,
    "--user-agent", "Codex-Extraction",
    $url
  )
  if (-not [string]::IsNullOrWhiteSpace($Proxy)) {
    $args = @("--proxy", $Proxy) + $args
  }
  return $args
}

function Assert-Size([string]$path, [int64]$expectedSize) {
  if ($expectedSize -le 0) { return }
  $actual = (Get-Item -LiteralPath $path).Length
  if ($actual -ne $expectedSize) {
    throw "Size mismatch for $path. Expected $expectedSize bytes, got $actual bytes."
  }
}

function Assert-Sha256([string]$path, [string]$expectedHash) {
  if ([string]::IsNullOrWhiteSpace($expectedHash)) { return }
  $actual = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($actual -ne $expectedHash.ToLowerInvariant()) {
    throw "SHA256 mismatch for $path. Expected $expectedHash, got $actual."
  }
  Write-Host "SHA256 OK: $path"
}

function Test-AssetComplete($asset, [string]$path) {
  if (-not (Test-Path -LiteralPath $path)) { return $false }
  try {
    Assert-Size $path ([int64]$asset.Size)
    Assert-Sha256 $path $asset.Sha256
    return $true
  } catch {
    Write-Host "Existing file is incomplete or invalid: $path"
    Write-Host $_.Exception.Message
    return $false
  }
}

function Merge-Parts([string[]]$parts, [string]$outputPath) {
  if (Test-Path -LiteralPath $outputPath) {
    Remove-Item -LiteralPath $outputPath -Force
  }

  $buffer = New-Object byte[] (8MB)
  $outStream = [System.IO.File]::Open($outputPath, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
  try {
    foreach ($part in $parts) {
      Write-Host "Merging $part"
      $inStream = [System.IO.File]::Open($part, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::Read)
      try {
        while (($read = $inStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
          $outStream.Write($buffer, 0, $read)
        }
      } finally {
        $inStream.Dispose()
      }
    }
  } finally {
    $outStream.Dispose()
  }
}

$root = (New-Item -ItemType Directory -Force -Path $OutputRoot).FullName
$partsDir = Join-Path $root "parts"
$extractDir = Join-Path $root "extracted"
New-Item -ItemType Directory -Force -Path $partsDir | Out-Null

Write-Host "Output: $root"
Write-Host "Release: v3.0-samples"

$smallAssets = $assets | Where-Object { $_.Name -notlike "*.zip.*" }
$partAssets = $assets | Where-Object { $_.Name -like "*.zip.*" } | Sort-Object { $_["Name"] }

foreach ($asset in $smallAssets) {
  $path = Join-Path $partsDir $asset.Name
  $url = Resolve-AssetUrl $asset.Name
  if (Test-AssetComplete $asset $path) {
    Write-Host "Already complete: $($asset.Name)"
    continue
  }
  Write-Host "Downloading $($asset.Name)"
  Invoke-CurlDownload $url $path
  Assert-Size $path ([int64]$asset.Size)
  Assert-Sha256 $path $asset.Sha256
}

$running = @()
foreach ($asset in $partAssets) {
  $path = Join-Path $partsDir $asset.Name
  if (Test-AssetComplete $asset $path) {
    Write-Host "Already complete: $($asset.Name)"
    continue
  }

  $url = Resolve-AssetUrl $asset.Name
  $stdout = Join-Path $partsDir "$($asset.Name).curl.out.log"
  $stderr = Join-Path $partsDir "$($asset.Name).curl.err.log"
  if (Test-Path -LiteralPath $stdout) { Remove-Item -LiteralPath $stdout -Force }
  if (Test-Path -LiteralPath $stderr) { Remove-Item -LiteralPath $stderr -Force }

  Write-Host "Starting download: $($asset.Name)"
  $process = Start-Process -FilePath "curl.exe" `
    -ArgumentList (Get-CurlArgs $url $path) `
    -RedirectStandardOutput $stdout `
    -RedirectStandardError $stderr `
    -WindowStyle Hidden `
    -PassThru

  $running += [pscustomobject]@{
    Asset = $asset
    Path = $path
    Process = $process
    StdErr = $stderr
  }
}

foreach ($item in $running) {
  Write-Host "Waiting for $($item.Asset.Name)"
  $item.Process.WaitForExit()
  if ($item.Process.ExitCode -ne 0) {
    if (Test-Path -LiteralPath $item.StdErr) {
      Get-Content -LiteralPath $item.StdErr -Tail 40 | ForEach-Object { Write-Host $_ }
    }
    throw "Download failed: $($item.Asset.Name)"
  }
}

foreach ($asset in $partAssets) {
  $path = Join-Path $partsDir $asset.Name
  Assert-Size $path ([int64]$asset.Size)
  Assert-Sha256 $path $asset.Sha256
}

$combinedPath = Join-Path $root $combinedName
$partPaths = $partAssets |
  ForEach-Object { Join-Path $partsDir $_.Name }

if (Test-Path -LiteralPath $combinedPath) {
  try {
    Assert-Sha256 $combinedPath $combinedSha256
    Write-Host "Already complete: $combinedName"
  } catch {
    Write-Host "Existing combined zip is invalid; rebuilding."
    Merge-Parts $partPaths $combinedPath
    Assert-Sha256 $combinedPath $combinedSha256
  }
} else {
  Merge-Parts $partPaths $combinedPath
  Assert-Sha256 $combinedPath $combinedSha256
}

if (-not $SkipExtract) {
  if (Test-Path -LiteralPath $extractDir) {
    $extractResolved = [System.IO.Path]::GetFullPath($extractDir)
    $rootResolved = [System.IO.Path]::GetFullPath($root)
    if (-not $extractResolved.StartsWith($rootResolved, [System.StringComparison]::OrdinalIgnoreCase)) {
      throw "Refusing to delete extraction directory outside output root: $extractResolved"
    }
    Remove-Item -LiteralPath $extractResolved -Recurse -Force
  }
  New-Item -ItemType Directory -Force -Path $extractDir | Out-Null
  $sevenZip = @(
    "C:\Program Files\7-Zip\7z.exe",
    "C:\Program Files (x86)\7-Zip\7z.exe"
  ) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

  if ($sevenZip) {
    & $sevenZip x "-o$extractDir" -y $combinedPath
    if ($LASTEXITCODE -ne 0) {
      throw "Extraction failed with 7-Zip"
    }
  } else {
    & tar.exe -xf $combinedPath -C $extractDir
    if ($LASTEXITCODE -ne 0) {
      throw "Extraction failed with tar.exe"
    }
  }
  Write-Host "Extracted to $extractDir"
}

Write-Host "Release data is complete."

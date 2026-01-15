param (
    [string]$BinaryName
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BinariesDir = Join-Path $ScriptDir "..\binaries"
if (-not (Test-Path $BinariesDir)) {
    New-Item -ItemType Directory -Force -Path $BinariesDir | Out-Null
}

$Repo = "router-for-me/CLIProxyAPI"
# Fetch latest version (no fallback - must succeed)
try {
    $LatestRelease = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest"
    $Version = $LatestRelease.tag_name -replace "^v", ""
} catch {
    Write-Error "Failed to fetch latest version from ${Repo}: $_"
    exit 1
}

if ([string]::IsNullOrEmpty($Version)) {
    Write-Error "Error: Fetched version is empty from $Repo"
    exit 1
}
Write-Host "Using CLIProxyAPI version: $Version"

# Determine Asset and ArchiveType based on BinaryName
$AssetName = ""

if ($BinaryName -match "x86_64-pc-windows-msvc") {
    $AssetName = "CLIProxyAPI_${Version}_windows_amd64.zip"
} elseif ($BinaryName -match "aarch64-pc-windows-msvc") {
    $AssetName = "CLIProxyAPI_${Version}_windows_arm64.zip"
} else {
    Write-Warning "Unknown target or not supported in this PS script: $BinaryName"
    exit 1
}

$Url = "https://github.com/$Repo/releases/download/v$Version/$AssetName"
Write-Host "Downloading $AssetName for $BinaryName..."
Write-Host "URL: $Url"

$TempDir = Join-Path $env:TEMP ([System.Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null

try {
    $ZipPath = Join-Path $TempDir $AssetName
    Invoke-WebRequest -Uri $Url -OutFile $ZipPath

    Expand-Archive -Path $ZipPath -DestinationPath $TempDir -Force

    $SourceExe = Join-Path $TempDir "cli-proxy-api.exe"
    $DestPath = Join-Path $BinariesDir $BinaryName

    if (Test-Path $SourceExe) {
        Copy-Item -Path $SourceExe -Destination $DestPath -Force
        Write-Host "Downloaded to $DestPath"
    } else {
        Write-Error "Binary not found in archive."
        exit 1
    }
} catch {
    Write-Error "Failed to download or extract: $_"
    exit 1
} finally {
    Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
}

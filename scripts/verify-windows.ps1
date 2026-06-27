<#
.SYNOPSIS
  Run ArchPDF Windows local verification checks in one command.

.DESCRIPTION
  Always runs: git status check, npm install, lint, typecheck, build.
  If -Branch is given: git fetch / checkout / pull that branch first.
  If -RunTauriDev is given: also run npm run tauri dev.
  If -RunTauriBuild is given: also run npm run tauri build and check bundle paths.
  Results are logged to logs/windows-verification/.
  Note: this script intentionally avoids non-ASCII characters to prevent
  encoding issues (Shift-JIS / UTF-8 BOM mismatches) on Windows PowerShell.
  PDF file paths and PDF content are never written to the log.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/verify-windows.ps1

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/verify-windows.ps1 -Branch feature/pdf-first-page-viewer -AutoStash -RunTauriDev -RunTauriBuild
#>

[CmdletBinding()]
param(
    [string]$Branch,
    [switch]$AutoStash,
    [switch]$RunTauriDev,
    [switch]$RunTauriBuild
)

$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

$Results = [ordered]@{
    Branch            = 'unknown'
    Commit            = 'unknown'
    npm_install       = 'not_run'
    lint              = 'not_run'
    typecheck         = 'not_run'
    build             = 'not_run'
    tauri_dev         = 'not_run'
    tauri_build       = 'not_run'
    auto_stash        = 'not_run'
    generated_bundles = 'not_checked'
}

$LogDir = Join-Path $RepoRoot 'logs/windows-verification'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$Timestamp = Get-Date -Format 'yyyy-MM-dd_HHmm'
$BranchLabel = if ($Branch) { $Branch -replace '[\\/]', '-' } else { 'current-branch' }
$LogFile = Join-Path $LogDir ("{0}_{1}.txt" -f $Timestamp, $BranchLabel)

function Write-Log {
    param([string]$Message)
    $Message | Tee-Object -FilePath $LogFile -Append | Out-Host
}

function Invoke-Step {
    param(
        [string]$Name,
        [scriptblock]$Action
    )
    Write-Log ("==== {0} ====" -f $Name)
    [string]$status = 'fail'
    try {
        $output = & $Action 2>&1
        foreach ($line in $output) {
            Write-Log ([string]$line)
        }
        if ($LASTEXITCODE -ne 0 -and $null -ne $LASTEXITCODE) {
            throw ("{0} failed with exit code {1}" -f $Name, $LASTEXITCODE)
        }
        $status = 'pass'
    } catch {
        Write-Log ("ERROR: {0}" -f $_.Exception.Message)
        $status = 'fail'
    }
    return [string]$status
}

Write-Log ("ArchPDF Windows Verification - {0}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))

# --- Branch fetch/checkout/pull ---
if ($Branch) {
    Write-Log "==== git fetch origin ===="
    git fetch origin 2>&1 | Tee-Object -FilePath $LogFile -Append | Out-Host

    $localBranchExists = [bool](git branch --list $Branch)
    if ($localBranchExists) {
        Write-Log ("==== git checkout {0} ====" -f $Branch)
        git checkout $Branch 2>&1 | Tee-Object -FilePath $LogFile -Append | Out-Host
    } else {
        Write-Log ("==== git checkout -b {0} origin/{0} ====" -f $Branch)
        git checkout -b $Branch "origin/$Branch" 2>&1 | Tee-Object -FilePath $LogFile -Append | Out-Host
    }

    Write-Log ("==== git pull origin {0} ====" -f $Branch)
    git pull origin $Branch 2>&1 | Tee-Object -FilePath $LogFile -Append | Out-Host
}

# --- git status check ---
Write-Log "==== git status ===="
$statusOutput = git status --short
$statusOutput | Tee-Object -FilePath $LogFile -Append | Out-Host

if ($statusOutput) {
    if ($AutoStash) {
        $stashMessage = "auto-stash-before-windows-verification-$Timestamp"
        Write-Log ("Working tree is not clean. Stashing local changes: {0}" -f $stashMessage)
        git stash push -u -m $stashMessage 2>&1 | Tee-Object -FilePath $LogFile -Append | Out-Host
        $Results.auto_stash = "stashed ($stashMessage)"
        Write-Log "Note: stash was not automatically popped. Restore manually with 'git stash pop' if needed."
    } else {
        Write-Log "Working tree is not clean."
        Write-Log "Use -AutoStash to stash local changes automatically."
        $Results.Branch = (git rev-parse --abbrev-ref HEAD)
        $Results.Commit = (git rev-parse --short HEAD)
        Write-Log ($Results | Out-String)
        exit 1
    }
}

$Results.Branch = (git rev-parse --abbrev-ref HEAD)
$Results.Commit = (git rev-parse --short HEAD)

# --- npm install / lint / typecheck / build ---
$Results.npm_install = Invoke-Step 'npm install' { npm install }
$Results.lint = Invoke-Step 'npm run lint' { npm run lint }
$Results.typecheck = Invoke-Step 'npm run typecheck' { npm run typecheck }
$Results.build = Invoke-Step 'npm run build' { npm run build }

# --- Tauri dev (optional) ---
if ($RunTauriDev) {
    Write-Log "Tauri dev will open the ArchPDF desktop app."
    Write-Log "After checking the window, close the app or press Ctrl+C in this terminal."
    Write-Log "Manual checks:"
    Write-Log "- App window opens"
    Write-Log "- PDF open button works"
    Write-Log "- PDF file can be selected"
    Write-Log "- First page is rendered"
    Write-Log "- File name and page count are shown"
    Write-Log "- No serious console errors"

    $Results.tauri_dev = Invoke-Step 'npm run tauri dev' { npm run tauri dev }
}

# --- Tauri build (optional) ---
if ($RunTauriBuild) {
    $Results.tauri_build = Invoke-Step 'npm run tauri build' { npm run tauri build }

    $msiPath = Join-Path $RepoRoot 'src-tauri/target/release/bundle/msi'
    $nsisPath = Join-Path $RepoRoot 'src-tauri/target/release/bundle/nsis'
    $msiExists = Test-Path $msiPath
    $nsisExists = Test-Path $nsisPath

    Write-Log ("MSI bundle path ({0}): {1}" -f $msiPath, $(if ($msiExists) { 'exists' } else { 'not_found' }))
    Write-Log ("NSIS bundle path ({0}): {1}" -f $nsisPath, $(if ($nsisExists) { 'exists' } else { 'not_found' }))

    $Results.generated_bundles = "msi={0}, nsis={1}" -f $(if ($msiExists) { 'exists' } else { 'not_found' }), $(if ($nsisExists) { 'exists' } else { 'not_found' })
}

# --- Summary ---
Write-Log ""
Write-Log "ArchPDF Windows Verification Summary"
Write-Log ""
foreach ($key in $Results.Keys) {
    Write-Log ("{0}: {1}" -f $key, $Results[$key])
}

Write-Log ""
Write-Log ("Log saved to: {0}" -f $LogFile)

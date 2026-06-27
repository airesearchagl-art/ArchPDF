<#
.SYNOPSIS
  ArchPDFのWindowsローカル動作確認をまとめて実行するスクリプト。

.DESCRIPTION
  git status確認 / npm install / lint / typecheck / build を必ず実行する。
  -Branch 指定時は fetch / checkout / pull まで行う。
  -RunTauriDev / -RunTauriBuild 指定時のみ、それぞれ npm run tauri dev / npm run tauri build を実行する。
  実行結果は logs/windows-verification/ 配下にタイムスタンプ付きで保存する。
  PDFファイルパスやPDF内容はログに出力しない。

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
    Branch            = $null
    Commit            = $null
    'npm install'     = '未実行'
    lint              = '未実行'
    typecheck         = '未実行'
    build             = '未実行'
    'tauri dev'       = '未実行'
    'tauri build'     = '未実行'
    AutoStash         = '未実施'
    'Generated bundles' = '未確認'
}

$LogDir = Join-Path $RepoRoot 'logs/windows-verification'
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$Timestamp = Get-Date -Format 'yyyy-MM-dd_HHmm'
$BranchLabel = if ($Branch) { $Branch -replace '[\\/]', '-' } else { 'current-branch' }
$LogFile = Join-Path $LogDir "$Timestamp`_$BranchLabel.txt"

function Write-Log {
    param([string]$Message)
    $Message | Tee-Object -FilePath $LogFile -Append | Out-Host
}

function Invoke-Step {
    param(
        [string]$Name,
        [scriptblock]$Action
    )
    Write-Log "==== $Name ===="
    try {
        & $Action
        if ($LASTEXITCODE -ne 0 -and $null -ne $LASTEXITCODE) {
            throw "$Name failed with exit code $LASTEXITCODE"
        }
        return 'pass'
    } catch {
        Write-Log "ERROR: $($_.Exception.Message)"
        return 'fail'
    }
}

Write-Log "ArchPDF Windows Verification - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# --- ブランチ指定時のfetch/checkout/pull ---
if ($Branch) {
    Write-Log "==== git fetch origin ===="
    git fetch origin 2>&1 | Tee-Object -FilePath $LogFile -Append | Out-Host

    $localBranchExists = [bool](git branch --list $Branch)
    if ($localBranchExists) {
        Write-Log "==== git checkout $Branch ===="
        git checkout $Branch 2>&1 | Tee-Object -FilePath $LogFile -Append | Out-Host
    } else {
        Write-Log "==== git checkout -b $Branch origin/$Branch ===="
        git checkout -b $Branch "origin/$Branch" 2>&1 | Tee-Object -FilePath $LogFile -Append | Out-Host
    }

    Write-Log "==== git pull origin $Branch ===="
    git pull origin $Branch 2>&1 | Tee-Object -FilePath $LogFile -Append | Out-Host
}

# --- git status確認 ---
Write-Log "==== git status ===="
$statusOutput = git status --short
$statusOutput | Tee-Object -FilePath $LogFile -Append | Out-Host

if ($statusOutput) {
    if ($AutoStash) {
        $stashMessage = "auto-stash-before-windows-verification-$Timestamp"
        Write-Log "Working tree is not clean. Stashing local changes: $stashMessage"
        git stash push -u -m $stashMessage 2>&1 | Tee-Object -FilePath $LogFile -Append | Out-Host
        $Results.AutoStash = "実施 ($stashMessage)"
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
$Results.'npm install' = Invoke-Step 'npm install' { npm install }
$Results.lint = Invoke-Step 'npm run lint' { npm run lint }
$Results.typecheck = Invoke-Step 'npm run typecheck' { npm run typecheck }
$Results.build = Invoke-Step 'npm run build' { npm run build }

# --- Tauri dev (任意) ---
if ($RunTauriDev) {
    Write-Log @"
Tauri dev will open the ArchPDF desktop app.
After checking the window, close the app or press Ctrl+C in this terminal.
Manual checks:
- App window opens
- PDF open button works
- PDF file can be selected
- First page is rendered
- File name and page count are shown
- No serious console errors
"@
    $Results.'tauri dev' = Invoke-Step 'npm run tauri dev' { npm run tauri dev }
}

# --- Tauri build (任意) ---
if ($RunTauriBuild) {
    $Results.'tauri build' = Invoke-Step 'npm run tauri build' { npm run tauri build }

    $msiPath = Join-Path $RepoRoot 'src-tauri/target/release/bundle/msi'
    $nsisPath = Join-Path $RepoRoot 'src-tauri/target/release/bundle/nsis'
    $msiExists = Test-Path $msiPath
    $nsisExists = Test-Path $nsisPath

    Write-Log "MSI bundle path ($msiPath): $(if ($msiExists) { 'exists' } else { 'not found' })"
    Write-Log "NSIS bundle path ($nsisPath): $(if ($nsisExists) { 'exists' } else { 'not found' })"

    $Results.'Generated bundles' = "msi=$(if ($msiExists) {'exists'} else {'not found'}), nsis=$(if ($nsisExists) {'exists'} else {'not found'})"
}

# --- サマリ表示 ---
Write-Log ''
Write-Log 'ArchPDF Windows Verification Summary'
Write-Log ''
foreach ($key in $Results.Keys) {
    Write-Log "$($key): $($Results[$key])"
}

Write-Log ''
Write-Log "Log saved to: $LogFile"

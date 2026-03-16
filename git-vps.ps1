# SynthezOPEDIA Git Workflow Script (VPS)
# Run on VPS for git operations
# Usage: .\git-vps.ps1 [options]

param(
    [string]$Status,
    [string]$Log,
    [switch]$Diff,
    [switch]$Add,
    [string]$Commit,
    [switch]$Push,
    [string]$Message,
    [switch]$All,
    [switch]$Help
)

if ($Help) {
    @"
SynthezOPEDIA Git Workflow Script (VPS)

Usage: .\git-vps.ps1 [OPTIONS]

Options:
    -Status          Check git status
    -Log [N]         Show N recent commits (default: 5)
    -Diff            Show unstaged changes
    -Add             Add all changes
    -Commit <msg>    Commit with message
    -Push            Push to remote
    -Message <msg>   Commit message (use with -All)
    -All             Add, commit and push
    -Help            Show this help

Examples:
    .\git-vps.ps1 -Status
    .\git-vps.ps1 -Log 3
    .\git-vps.ps1 -Diff
    .\git-vps.ps1 -Commit "Fix bug"
    .\git-vps.ps1 -All -Message "New feature"
"@
    exit 0
}

# STATUS
if ($Status) {
    git status
    exit 0
}

# LOG
if ($Log) {
    $count = if ($Log -match '^\d+$') { $Log } else { 5 }
    git log --oneline -$count
    exit 0
}

# DIFF
if ($Diff) {
    git diff
    exit 0
}

# ADD
if ($Add) {
    git add -A
    Write-Host "Added all files to staging"
    git status
    exit 0
}

# COMMIT
if ($Commit) {
    git add -A
    git commit -m $Commit
    Write-Host "Committed: $Commit"
    exit 0
}

# PUSH
if ($Push) {
    git push origin HEAD:main
    exit 0
}

# ALL (add + commit + push)
if ($All) {
    if (-not $Message) {
        Write-Host "Error: -Message required for -All" -ForegroundColor Red
        exit 1
    }
    git add -A
    git commit -m $Message
    Write-Host "Committed: $Message"
    git push origin HEAD:main
    Write-Host "Pushed to origin/main" -ForegroundColor Green
    exit 0
}

# Default: show help
& $PSCommandPath -Help

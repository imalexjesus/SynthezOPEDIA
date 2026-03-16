# SynthezOPEDIA Deploy Script (LOCAL)
# Run from local machine to build and deploy to VPS
# Usage: .\deploy-local.ps1 [options]

param(
    [switch]$Pull,
    [switch]$Check,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

$VPS_HOST = "62.171.162.59"
$VPS_USER = "root"
$VPS_PATH = "/opt/docker/synthezopedia"

if ($Help) {
    @"
SynthezOPEDIA Deploy Script (LOCAL)

Usage: .\deploy-local.ps1 [OPTIONS]

Options:
    -Pull     Pull changes, build and deploy
    -Check    Check local build status
    -Help     Show this help

Examples:
    .\deploy-local.ps1 -Pull      # Build and deploy to VPS
    .\deploy-local.ps1 -Check     # Check status
"@
    exit 0
}

$MODE = "pull"
if ($Check) { $MODE = "check" }

Write-Host "Mode: $MODE" -ForegroundColor Cyan

# CHECK
if ($MODE -eq "check") {
    Write-Host "Checking git status..." -ForegroundColor Yellow
    git status
    Write-Host ""
    Write-Host "Recent commits:" -ForegroundColor Yellow
    git log --oneline -5
    exit 0
}

# PULL, BUILD, DEPLOY
Write-Host "Pulling latest changes..." -ForegroundColor Yellow
git fetch --all
git pull origin main

Write-Host "Building Docker image locally..." -ForegroundColor Yellow
docker build -t synthezopedia:latest .

Write-Host "Saving Docker image..." -ForegroundColor Yellow
docker save synthezopedia:latest -o /tmp/synthezopedia.tar

Write-Host "Deploying to VPS..." -ForegroundColor Yellow
Copy-Item /tmp/synthezopedia.tar "\\$VPS_HOST\c$\temp\" -Credential (Get-Credential) -ErrorAction SilentlyContinue

# Fallback to scp if above fails
if (-not (Test-Path "\\$VPS_HOST\c$\temp\synthezopedia.tar")) {
    Write-Host "Using SCP..." -ForegroundColor Yellow
    scp /tmp/synthezopedia.tar "${VPS_USER}@${VPS_HOST}:/tmp/"
    $sshCmd = "cd ${VPS_PATH} && docker load -i /tmp/synthezopedia.tar && docker stop synthezopedia 2>`$null; docker rm synthezopedia 2>`$null; docker run -d --name synthezopedia --restart=unless-stopped -p 3001:3000 -v `$PWD/data:/app/data -v `$PWD/cache:/app/static/images/cache --env-file .env synthezopedia:latest"
    ssh "${VPS_USER}@${VPS_HOST}" $sshCmd
}

Remove-Item /tmp/synthezopedia.tar -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host "Access the site at: http://${VPS_HOST}:3001/"

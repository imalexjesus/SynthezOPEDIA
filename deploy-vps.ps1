# SynthezOPEDIA Deploy Script (VPS)
# Run on VPS to update from GitHub
# Usage: .\deploy-vps.ps1 [options]

param(
    [switch]$Pull,
    [switch]$Check,
    [switch]$Hard,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $SCRIPT_DIR

$CONTAINER_NAME = "synthezopedia"
$IMAGE_NAME = "synthezopedia:latest"
$BRANCH = "main"

# Set upstream branch
git branch --set-upstream-to=origin/$BRANCH $BRANCH 2>$null

if ($Help) {
    @"
SynthezOPEDIA Deploy Script (VPS)

Usage: .\deploy-vps.ps1 [OPTIONS]

Options:
    -Pull     Pull changes and restart (fast update)
    -Check    Check container status and logs
    -Hard     Full reinstall (stop, remove, rebuild, start)
    -Help     Show this help

Examples:
    .\deploy-vps.ps1 -Pull      # Fast update
    .\deploy-vps.ps1 -Check     # Check status
    .\deploy-vps.ps1 -Hard      # Full reinstall
"@
    exit 0
}

$MODE = "pull"
if ($Check) { $MODE = "check" }
if ($Hard) { $MODE = "hard" }

Write-Host "Mode: $MODE" -ForegroundColor Cyan

# CHECK STATUS
if ($MODE -eq "check") {
    Write-Host ""
    Write-Host "Container status:" -ForegroundColor Yellow
    docker ps -a | Select-String $CONTAINER_NAME
    Write-Host ""
    Write-Host "Recent logs:" -ForegroundColor Yellow
    docker logs $CONTAINER_NAME --tail 30 2>&1
    Write-Host ""
    Write-Host "Port check:" -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri "http://localhost:3001/" -TimeoutSec 5 | Select-Object -First 10
    } catch {
        Write-Host "Connection failed" -ForegroundColor Red
    }
    exit 0
}

# HARD REINSTALL
if ($MODE -eq "hard") {
    Write-Host "Stopping and removing container..." -ForegroundColor Yellow
    docker stop $CONTAINER_NAME 2>$null
    docker rm $CONTAINER_NAME 2>$null
    
    Write-Host "Removing old image..." -ForegroundColor Yellow
    docker image rm $IMAGE_NAME 2>$null
    
    Write-Host "Pulling latest code..." -ForegroundColor Yellow
    git fetch --all
    git reset --hard origin/$BRANCH
    
    Write-Host "Building Docker image..." -ForegroundColor Yellow
    docker build -t $IMAGE_NAME .
    
    Write-Host "Starting container..." -ForegroundColor Yellow
    docker run -d --name $CONTAINER_NAME --restart=unless-stopped -p 3001:3000 -v ./data:/app/data -v ./cache:/app/static/images/cache --env-file .env $IMAGE_NAME
    
    Write-Host ""
    Write-Host "Done!" -ForegroundColor Green
    docker ps -a | Select-String $CONTAINER_NAME
    exit 0
}

# PULL AND RESTART
Write-Host "Pulling changes from GitHub..." -ForegroundColor Yellow
git fetch --all
git pull origin $BRANCH 2>$null
if ($LASTEXITCODE -ne 0) { git reset --hard origin/$BRANCH }

Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t $IMAGE_NAME .

Write-Host "Restarting container..." -ForegroundColor Yellow
docker restart $CONTAINER_NAME

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
docker ps -a | Select-String $CONTAINER_NAME

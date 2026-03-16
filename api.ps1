# SynthezOPEDIA API Management Script (PowerShell)
# Usage: .\api.ps1 [options]

param(
    [switch]$List,
    [switch]$Refresh,
    [switch]$Sync,
    [switch]$Get,
    [switch]$Noco,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

$CONTAINER_NAME = "synthezopedia"
$BASE_URL = "http://localhost:3001"

if ($Help) {
    @"
SynthezOPEDIA API Management Script (PowerShell)

Usage: .\api.ps1 [OPTIONS]

Options:
    -List       List cached images
    -Refresh    Refresh all image cache from URLs
    -Sync       Sync all synths to NocoDB
    -Get        Get all synths from API
    -Noco       Test NocoDB connection
    -Help       Show this help

Examples:
    .\api.ps1 -List
    .\api.ps1 -Refresh
    .\api.ps1 -Sync
    .\api.ps1 -Get
    .\api.ps1 -Noco
"@
    exit 0
}

# Default: show help
if (-not ($List -or $Refresh -or $Sync -or $Get -or $Noco)) {
    & $PSCommandPath -Help
    exit 1
}

# LIST CACHED IMAGES
if ($List) {
    Write-Host "Listing cached images..." -ForegroundColor Cyan
    Invoke-RestMethod -Uri "$BASE_URL/api/images/list" | Select-Object -First 50
    exit 0
}

# REFRESH ALL IMAGE CACHE
if ($Refresh) {
    Write-Host "Refreshing all image cache..." -ForegroundColor Cyan
    Write-Host "This may take a while..."
    Invoke-RestMethod -Uri "$BASE_URL/api/cache-image/refresh-all" -Method POST
    Write-Host "Done!" -ForegroundColor Green
    exit 0
}

# SYNC ALL SYNTHS TO NOCODB
if ($Sync) {
    Write-Host "Syncing all synths to NocoDB..." -ForegroundColor Cyan
    Write-Host "Getting all synths..."
    
    $synths = Invoke-RestMethod -Uri "$BASE_URL/api/synths?includeInactive=true"
    $count = $synths.items.Count
    
    Write-Host "Found $count synths"
    exit 0
}

# GET ALL SYNTHS
if ($Get) {
    Write-Host "Getting all synths..." -ForegroundColor Cyan
    Invoke-RestMethod -Uri "$BASE_URL/api/synths" | Select-Object -First 100
    exit 0
}

# TEST NOCODB CONNECTION
if ($Noco) {
    Write-Host "Testing NocoDB connection..." -ForegroundColor Cyan
    $url = docker exec $CONTAINER_NAME sh -c 'echo $NOCODB_BASE_URL'
    if ([string]::IsNullOrEmpty($url)) {
        Write-Host "NocoDB not configured" -ForegroundColor Yellow
    } else {
        Write-Host "NocoDB URL: $url" -ForegroundColor Green
    }
    exit 0
}

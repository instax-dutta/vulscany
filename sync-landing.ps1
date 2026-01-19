# Aeglyn Landing Page Sync Script
# Fetches latest commits from the landing page repository

param(
    [Parameter(Position = 0)]
    [ValidateSet('status', 'pull', 'help')]
    [string]$Command = 'help'
)

$LandingPageRepo = "https://github.com/instax-dutta/vulscany-landing-v1"
$LandingPageDir = "vulscany-landing"

function Show-Help {
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "     Aeglyn Landing Page Sync Script          " -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "This script helps you sync the landing page repo" -ForegroundColor Yellow
    Write-Host "when working on the main application." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Green
    Write-Host "  status  - Check if landing page repo exists and its status"
    Write-Host "  pull    - Pull latest changes from landing page repo"
    Write-Host "  help    - Show this help message"
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Green
    Write-Host "  .\sync-landing.ps1 status"
    Write-Host "  .\sync-landing.ps1 pull"
    Write-Host ""
    Write-Host "Note:" -ForegroundColor Yellow
    Write-Host "  The landing page is managed separately and edited on a different device."
    Write-Host "  Use this script to pull updates when needed for development."
    Write-Host ""
}

function Check-Status {
    Write-Host ""
    Write-Host "Checking landing page repository..." -ForegroundColor Cyan
    
    if (Test-Path $LandingPageDir) {
        Write-Host "SUCCESS: Landing page directory exists" -ForegroundColor Green
        Write-Host ""
        Write-Host "Repository status:" -ForegroundColor Cyan
        Push-Location $LandingPageDir
        git status
        Write-Host ""
        Write-Host "Latest commit:" -ForegroundColor Cyan
        git log --oneline -1
        Pop-Location
    }
    else {
        Write-Host "WARNING: Landing page directory not found" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To clone the landing page repository, run:" -ForegroundColor Yellow
        Write-Host "  git clone $LandingPageRepo $LandingPageDir" -ForegroundColor White
    }
    Write-Host ""
}

function Pull-Updates {
    Write-Host ""
    Write-Host "Pulling latest changes from landing page..." -ForegroundColor Cyan
    
    if (Test-Path $LandingPageDir) {
        Push-Location $LandingPageDir
        
        Write-Host "Fetching updates..." -ForegroundColor Cyan
        git fetch origin main
        
        Write-Host ""
        Write-Host "Pulling changes..." -ForegroundColor Cyan
        git pull origin main
        
        Write-Host ""
        Write-Host "SUCCESS: Landing page updated!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Latest commit:" -ForegroundColor Cyan
        git log --oneline -1
        
        Pop-Location
    }
    else {
        Write-Host "ERROR: Landing page directory not found" -ForegroundColor Red
        Write-Host ""
        Write-Host "Cloning landing page repository..." -ForegroundColor Cyan
        git clone $LandingPageRepo $LandingPageDir
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "SUCCESS: Landing page cloned!" -ForegroundColor Green
        }
        else {
            Write-Host ""
            Write-Host "ERROR: Failed to clone landing page" -ForegroundColor Red
        }
    }
    Write-Host ""
}

# Main execution
switch ($Command) {
    'status' { Check-Status }
    'pull' { Pull-Updates }
    'help' { Show-Help }
    default { Show-Help }
}

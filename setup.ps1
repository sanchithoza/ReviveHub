param(
    [switch]$SkipNodeCheck
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Test-NodeInstalled {
    try {
        $version = node --version
        Write-Host "  Found Node.js: $version" -ForegroundColor Green
        return $true
    } catch {
        return $false
    }
}

function Test-NpmInstalled {
    try {
        $version = npm --version
        Write-Host "  Found npm: v$version" -ForegroundColor Green
        return $true
    } catch {
        return $false
    }
}

function Install-NodeUsingWinget {
    Write-Step "Installing Node.js via winget..."
    $nodePackage = winget search "OpenJS.NodeJS.LTS" --accept-source-agreements 2>$null
    if ($LASTEXITCODE -eq 0) {
        winget install "OpenJS.NodeJS.LTS" --accept-source-agreements --accept-package-agreements
        $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
        return $true
    }
    return $false
}

function Install-NodeUsingChoco {
    Write-Step "Installing Node.js via Chocolatey..."
    choco install nodejs-lts -y
    refreshenv
    return $true
}

function Install-Dependencies {
    param([string]$Directory, [string]$Label)
    Write-Step "Installing $Label dependencies..."
    Set-Location -LiteralPath $Directory
    if (Test-Path -LiteralPath "package-lock.json") {
        npm ci
    } else {
        npm install
    }
}

# ----- Main Script -----

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   ReviveHub - Project Setup" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

if (-not $SkipNodeCheck) {
    Write-Step "Checking for Node.js..."
    $nodeInstalled = Test-NodeInstalled
    $npmInstalled = Test-NpmInstalled

    if (-not $nodeInstalled -or -not $npmInstalled) {
        Write-Host "  Node.js/npm not found. Attempting installation..." -ForegroundColor Yellow

        $installSuccess = $false
        if (-not $installSuccess) { $installSuccess = Install-NodeUsingWinget }
        if (-not $installSuccess) { $installSuccess = Install-NodeUsingChoco }

        if (-not $installSuccess) {
            Write-Host "  Could not install Node.js automatically." -ForegroundColor Red
            Write-Host "  Please install Node.js manually from: https://nodejs.org/" -ForegroundColor Yellow
            Write-Host "  Then re-run this script with -SkipNodeCheck" -ForegroundColor Yellow
            exit 1
        }

        $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
        if (-not (Test-NodeInstalled)) {
            Write-Host "  Node.js installation detected but not in PATH. Please restart your terminal and re-run this script." -ForegroundColor Red
            exit 1
        }
    } else {
        $requiredMinVersion = "18.17.0"
        $currentVersion = node -e "process.stdout.write(process.versions.node)"
        if ([Version]$currentVersion -lt [Version]$requiredMinVersion) {
            Write-Host "  Node.js $currentVersion is too old. Need >= $requiredMinVersion. Please upgrade." -ForegroundColor Red
            exit 1
        }
    }
}

Install-Dependencies -Directory "$projectRoot\server" -Label "server"
Install-Dependencies -Directory "$projectRoot\client" -Label "client"

Write-Step "Running database migrations..."
Set-Location -LiteralPath "$projectRoot\server"
try {
    npm run migrate
    Write-Host "  Migrations applied successfully." -ForegroundColor Green
} catch {
    Write-Host "  Migrations skipped or failed: $_" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "   Setup complete!" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "`nTo start the project:"
Write-Host "  Server:  cd server && npm run dev"
Write-Host "  Client:  cd client && npm run dev"
Write-Host "`nOr run both from the root in separate terminals." -ForegroundColor Cyan

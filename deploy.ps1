param(
    [string]$DeploymentPath = "C:\ReviveHub",
    [string]$ServerPort = "3001",
    [string]$ClientPort = "3000",
    [string]$NodeEnv = "production",
    [string]$DatabasePath = "",
    [switch]$SkipBuild,
    [switch]$SetupServices
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

$serverSource = Join-Path -Path $projectRoot -ChildPath "server"
$clientSource = Join-Path -Path $projectRoot -ChildPath "client"
$serverDestination = Join-Path -Path $DeploymentPath -ChildPath "server"
$clientDestination = Join-Path -Path $DeploymentPath -ChildPath "client"

if ([string]::IsNullOrEmpty($DatabasePath)) {
    $DatabasePath = Join-Path -Path $DeploymentPath -ChildPath "data\data.db"
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "  $Message" -ForegroundColor Green
}

function Assert-LastExit {
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed with exit code $LASTEXITCODE"
    }
}

# ----- Main Script -----

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   ReviveHub - Build & Deploy" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

Write-Host "`nDeployment target: $DeploymentPath" -ForegroundColor White

# ---- Step 1: Build ----
if (-not $SkipBuild) {
    Write-Step "Building server..."
    Set-Location -LiteralPath $serverSource
    npm run build
    Assert-LastExit
    Write-Success "Server build complete."

    Write-Step "Building client..."
    Set-Location -LiteralPath $clientSource
    npm run build
    Assert-LastExit
    Write-Success "Client build complete."
}

# ---- Step 2: Create deployment directories ----
Write-Step "Creating deployment directories..."
$directoriesToCreate = @(
    $DeploymentPath,
    $serverDestination,
    $clientDestination,
    (Join-Path -Path $DeploymentPath -ChildPath "data"),
    (Join-Path -Path $DeploymentPath -ChildPath "logs")
)
foreach ($directory in $directoriesToCreate) {
    if (-not (Test-Path -LiteralPath $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
        Write-Success "Created: $directory"
    }
}

# ---- Step 3: Deploy server ----
Write-Step "Deploying server..."
$serverExclusions = @("node_modules", "src", "tsconfig.json", "*.ts")

Copy-Item -Path (Join-Path -Path $serverSource -ChildPath "dist") `
         -Destination $serverDestination `
         -Recurse -Force
Write-Success "Copied dist/"

$serverConfigFiles = @("package.json", "package-lock.json")
foreach ($configFile in $serverConfigFiles) {
    $sourceFilePath = Join-Path -Path $serverSource -ChildPath $configFile
    if (Test-Path -LiteralPath $sourceFilePath) {
        Copy-Item -Path $sourceFilePath -Destination $serverDestination -Force
        Write-Success "Copied $configFile"
    }
}

Write-Step "Installing server production dependencies..."
Set-Location -LiteralPath $serverDestination
npm install --omit=dev
Assert-LastExit
Write-Success "Server production dependencies installed."

# ---- Step 4: Deploy client ----
Write-Step "Deploying client..."
Copy-Item -Path (Join-Path -Path $clientSource -ChildPath ".next") `
         -Destination $clientDestination `
         -Recurse -Force
Write-Success "Copied .next/"

$clientAssetPaths = @("public", "package.json", "package-lock.json", "next.config.mjs")
foreach ($assetPath in $clientAssetPaths) {
    $sourceAssetPath = Join-Path -Path $clientSource -ChildPath $assetPath
    if (Test-Path -LiteralPath $sourceAssetPath) {
        Copy-Item -Path $sourceAssetPath -Destination $clientDestination -Recurse -Force
        Write-Success "Copied $assetPath"
    }
}

Write-Step "Installing client production dependencies..."
Set-Location -LiteralPath $clientDestination
npm install --omit=dev
Assert-LastExit
Write-Success "Client production dependencies installed."

# ---- Step 5: Preserve existing database ----
Write-Step "Preserving existing database..."
$databaseDirectory = Split-Path -Parent $DatabasePath
if (-not (Test-Path -LiteralPath $databaseDirectory)) {
    New-Item -ItemType Directory -Path $databaseDirectory -Force | Out-Null
    Write-Success "Created database directory: $databaseDirectory"
}

if (Test-Path -LiteralPath $DatabasePath) {
    Write-Success "Existing database found at: $DatabasePath (will be preserved)"
} else {
    Write-Host "  No existing database at: $DatabasePath (will be created on first run)" -ForegroundColor Yellow
}

# ---- Step 6: Run database migrations ----
Write-Step "Running database migrations..."
Set-Location -LiteralPath $serverDestination
$env:DATABASE_PATH = $DatabasePath
try {
    npm run migrate
    Write-Success "Database migrations applied."
} catch {
    Write-Host "  Migrations failed: $_" -ForegroundColor Red
    throw $_
}

# ---- Step 7: Create startup scripts ----
Write-Step "Creating startup scripts..."

$serverStartupScript = @"
`$ErrorActionPreference = "Stop"
`$scriptDirectory = Split-Path -Parent `$MyInvocation.MyCommand.Path
Set-Location -LiteralPath `$scriptDirectory
`$env:NODE_ENV = "$NodeEnv"
`$env:PORT = "$ServerPort"
`$env:DATABASE_PATH = "$DatabasePath"
Write-Host "Starting ReviveHub server on port $ServerPort..."
Write-Host "Database: `$env:DATABASE_PATH"
node dist/index.js
"@
$serverStartupScriptPath = Join-Path -Path $serverDestination -ChildPath "start-server.ps1"
Set-Content -Path $serverStartupScriptPath -Value $serverStartupScript
Write-Success "Created start-server.ps1"

$clientStartupScript = @"
`$ErrorActionPreference = "Stop"
`$scriptDirectory = Split-Path -Parent `$MyInvocation.MyCommand.Path
Set-Location -LiteralPath `$scriptDirectory
`$env:NODE_ENV = "$NodeEnv"
`$env:PORT = "$ClientPort"
Write-Host "Starting ReviveHub client on port $ClientPort..."
npx next start -p `$env:PORT
"@
$clientStartupScriptPath = Join-Path -Path $clientDestination -ChildPath "start-client.ps1"
Set-Content -Path $clientStartupScriptPath -Value $clientStartupScript
Write-Success "Created start-client.ps1"

# ---- Step 8: Optionally set up Windows services via NSSM ----
if ($SetupServices) {
    Write-Step "Setting up Windows services..."
    $nssmCheck = Get-Command nssm.exe -ErrorAction SilentlyContinue
    if (-not $nssmCheck) {
        Write-Host "  NSSM not found. Downloading..." -ForegroundColor Yellow
        $nssmUrl = "https://nssm.cc/release/nssm-2.24.zip"
        $nssmZip = "$env:TEMP\nssm.zip"
        $nssmExtract = "$env:TEMP\nssm"
        Invoke-WebRequest -Uri $nssmUrl -OutFile $nssmZip
        Expand-Archive -Path $nssmZip -DestinationPath $nssmExtract -Force
        $nssmPath = Get-ChildItem -Path $nssmExtract -Recurse -Filter "nssm.exe" | Select-Object -First 1 -ExpandProperty FullName
    } else {
        $nssmPath = "nssm.exe"
    }

    & $nssmPath install ReviveHub-Server "powershell.exe" "-File `"$serverStartupScriptPath`"" 2>$null
    & $nssmPath install ReviveHub-Client "powershell.exe" "-File `"$clientStartupScriptPath`"" 2>$null

    & $nssmPath set ReviveHub-Server AppDirectory "$serverDestination"
    & $nssmPath set ReviveHub-Client AppDirectory "$clientDestination"

    & $nssmPath set ReviveHub-Server AppEnvironmentExtra "DATABASE_PATH=$DatabasePath"
    & $nssmPath set ReviveHub-Client AppEnvironmentExtra "NEXT_PUBLIC_API_URL=http://localhost:$ServerPort/api"

    & $nssmPath set ReviveHub-Server Start SERVICE_AUTO_START
    & $nssmPath set ReviveHub-Client Start SERVICE_AUTO_START

    Write-Success "Windows services created: ReviveHub-Server, ReviveHub-Client"
    Write-Host "  Start them with: Start-Service ReviveHub-Server, ReviveHub-Client" -ForegroundColor Yellow
}

# ---- Step 9: Summary ----
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "   Deploy complete!" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "`nDeployed to: $DeploymentPath"
Write-Host "Database: $DatabasePath (preserved across deployments)"
Write-Host "`nTo start manually:"
Write-Host "  Server:  powershell -File `"$serverStartupScriptPath`""
Write-Host "  Client:  powershell -File `"$clientStartupScriptPath`""
Write-Host "`nServer running at: http://localhost:$ServerPort"
Write-Host "Client running at: http://localhost:$ClientPort"
Write-Host "`nTo set up as Windows services later, re-run with -SetupServices" -ForegroundColor Cyan

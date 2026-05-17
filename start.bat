@echo off
title ReviveHub - Quick Start
cd /d "%~dp0"

echo ========================================
echo        ReviveHub - Quick Start
echo ========================================
echo.

REM ---- Check Node.js ----
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed.
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js found: 
node --version

REM ---- Install server dependencies ----
echo.
echo [1/4] Installing server dependencies...
cd server
if not exist node_modules (
    call npm install
) else (
    echo   Dependencies already installed.
)
cd ..

REM ---- Install client dependencies ----
echo.
echo [2/4] Installing client dependencies...
cd client
if not exist node_modules (
    call npm install
) else (
    echo   Dependencies already installed.
)
cd ..

REM ---- Build and deploy ----
echo.
echo [3/4] Building and deploying...
powershell -ExecutionPolicy Bypass -File "deploy.ps1" -SkipNodeCheck

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Build/Deploy failed. Check the output above.
    pause
    exit /b 1
)

REM ---- Start server and client ----
echo.
echo [4/4] Starting ReviveHub...
echo.
start "ReviveHub - Server" cmd /c "cd /d "%~dp0server" && title ReviveHub - Server && echo Server starting on http://localhost:3001 && npm run dev"
start "ReviveHub - Client" cmd /c "cd /d "%~dp0client" && title ReviveHub - Client && echo Client starting on http://localhost:3000 && npm run dev"

echo ========================================
echo   Server:  http://localhost:3001
echo   Client:  http://localhost:3000
echo ========================================
echo.
echo Close the windows to stop the server and client.
echo.
pause

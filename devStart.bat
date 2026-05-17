@echo off
cd /d "%~dp0"

echo Starting ReviveHub dev environment...

start "ReviveHub - Server" cmd /c "cd /d "%~dp0server" && title ReviveHub - Server && npm run dev"
start "ReviveHub - Client" cmd /c "cd /d "%~dp0client" && title ReviveHub - Client && npm run dev"

echo.
echo Server:  http://localhost:3001
echo Client:  http://localhost:3000
echo.
echo Close the windows to stop.
pause

@echo off
echo ========================================
echo   Starting LLM-Based DBMS
echo ========================================
echo.

echo Starting Backend Server...
echo.
cd /d "%~dp0backend_server"
start "Backend Server" cmd /k "node server.js"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
echo.
cd /d "%~dp0frontend"
start "Frontend Server" cmd /k "node server.js"

timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Opening frontend in browser...
echo.
start http://localhost:3000

echo.
echo Close the server windows to stop the servers.
echo ========================================
pause

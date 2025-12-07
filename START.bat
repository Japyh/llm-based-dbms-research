@echo off
cls
color 0A

echo.
echo ========================================
echo   LLM-Based DBMS - Full Stack Launcher
echo ========================================
echo.
echo Starting services...
echo.

REM Kill any existing node processes on ports 8000 and 3000
echo [1/4] Checking for existing servers...
netstat -ano | findstr :8000 >nul 2>&1
if %errorlevel%==0 (
    echo       Port 8000 in use, clearing...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /F /PID %%a >nul 2>&1
)

netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel%==0 (
    echo       Port 3000 in use, clearing...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [2/4] Starting Backend Server (Port 8000)...
start "LLM-DBMS Backend :8000" cmd /k "cd /d %~dp0backend_server && echo Backend Starting... && node server.js"

REM Wait for backend to initialize
timeout /t 4 /nobreak >nul

echo [3/4] Starting Frontend Server (Port 3000)...
start "LLM-DBMS Frontend :3000" cmd /k "cd /d %~dp0frontend && echo Frontend Starting... && node server.js"

REM Wait for frontend to initialize
timeout /t 3 /nobreak >nul

echo [4/4] Opening Browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo   All Systems Online!
echo ========================================
echo.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo.
echo   Press any key to view logs...
echo ========================================
echo.
pause

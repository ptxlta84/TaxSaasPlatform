@echo off
echo Checking System Status...
echo.

:: Check Frontend
curl -I http://localhost:8080 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend is RUNNING (http://localhost:8080)
) else (
    echo [ERROR] Frontend is NOT reachable.
)

:: Check Backend
curl -I http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend is RUNNING (http://localhost:5000)
) else (
    echo [WARNING] Backend is NOT reachable (or /health endpoint missing).
    echo           Trying root...
    curl -I http://localhost:5000 >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Backend is RUNNING (Root confirmed)
    ) else (
        echo [ERROR] Backend is NOT reachable.
    )
)

pause

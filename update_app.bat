@echo off
echo ===================================================
echo      TaxSaas Platform - One-Click Update Tool
echo ===================================================
echo.
echo [1/3] Stopping currently running version...
docker-compose down

echo.
echo [2/3] Rebuilding with your LATEST ITR-2 changes...
echo       (This packs your new code into the 'suitcase')
docker-compose up --build -d

echo.
echo [3/3] Deployment Complete! 
echo       Your updated app is running at: http://localhost:8080
echo.
pause

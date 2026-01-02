@echo off
echo ===================================================
echo      TaxSaas Platform - Shutdown
echo ===================================================
echo.
echo Stopping all servers and database...
docker-compose down
echo.
echo [SUCCESS] Everything is stopped. Have a good rest!
echo.
pause

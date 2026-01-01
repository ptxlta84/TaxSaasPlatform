@echo off
echo ===================================================
echo      TaxSaas Platform - Developer Mode
echo ===================================================
echo.
echo Starting Backend Server...
start "TaxSaas Backend" cmd /k "cd server && npm run dev"

echo Starting Frontend Client...
start "TaxSaas Client" cmd /k "cd client && npm run dev"

echo.
echo [SUCCESS] Both servers are launching in new windows!
echo You can start coding now.
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
pause

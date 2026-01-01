@echo off
echo Starting Local Database...
docker-compose up -d mongo
echo.
echo [SUCCESS] Database is running in the background.
echo You can now check your 'start_dev.bat' windows - the server should connect automatically!
pause

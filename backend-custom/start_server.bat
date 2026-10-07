@echo off
title OTEC LAN Server

echo =======================================
echo     OTEC Custom LAN Server Startup
echo =======================================
echo.

:: Check if node_modules exists
IF NOT EXIST "node_modules\" (
    echo [INFO] Dependencies not found. Installing now...
    echo.
    call npm install
    echo.
    echo [INFO] Installation complete!
) ELSE (
    echo [INFO] Dependencies already installed. Skipping installation.
)

echo [INFO] Starting the server...
echo.
node server.js

pause

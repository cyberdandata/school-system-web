@echo off
setlocal
echo ========================================================
echo School Management System - Initial Setup (Windows)
echo ========================================================

:: GitHub Repository URL
set REPO_URL=https://github.com/smakangeljs-creator/otec-school-app.git
set FOLDER_NAME=school management system

echo Cloning repository from GitHub...
git clone "%REPO_URL%" "%FOLDER_NAME%"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to clone repository. Please make sure Git is installed and the URL is correct.
    pause
    exit /b 1
)

cd "%FOLDER_NAME%"

echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies. Please make sure Node.js is installed on your machine.
    pause
    exit /b 1
)

echo Starting the development server...
echo (The server will be accessible on your local network)
call npm run dev

pause

@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title OTEC School System - Smart Launcher

echo.
echo  ==========================================
echo   OTEC Academy School Management System
echo   Smart Dependency Manager ^& Launcher
echo  ==========================================
echo.

:: -----------------------------------------------
:: STEP 1: Check if Node.js is installed
:: -----------------------------------------------
echo [1/5] Checking for Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  [ERROR] Node.js is NOT installed on this machine!
    echo.
    echo  Please download and install Node.js from:
    echo  https://nodejs.org/en/download
    echo.
    echo  After installing, re-run this file.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo  [OK] Node.js found: %NODE_VERSION%

:: -----------------------------------------------
:: STEP 2: Check if npm is available
:: -----------------------------------------------
echo.
echo [2/5] Checking for npm...
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] npm is NOT found. Please reinstall Node.js.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo  [OK] npm found: v%NPM_VERSION%

:: -----------------------------------------------
:: STEP 3: Check if dependencies are installed
:: -----------------------------------------------
echo.
echo [3/5] Checking dependencies (node_modules)...

if not exist "node_modules\" (
    echo  [INFO] node_modules not found. Installing dependencies for the first time...
    echo  This may take a few minutes. Please wait...
    echo.
    call npm install --no-audit --no-fund
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo  [ERROR] Dependency installation failed!
        echo  Please check your internet connection and try again.
        pause
        exit /b 1
    )
    echo.
    echo  [OK] All dependencies installed successfully!
    goto FETCH_UPDATES
)

echo  [OK] node_modules folder found.

:: -----------------------------------------------
:: STEP 4: Check if dependencies are outdated
:: -----------------------------------------------
echo.
echo [4/5] Checking for outdated packages...
echo  (Running npm outdated - this checks your installed vs. latest versions)
echo.

npm outdated --depth=0 2>nul
if %ERRORLEVEL% EQU 0 (
    echo  [OK] All packages are up to date! No updates needed.
) else (
    echo.
    echo  [INFO] Some packages are outdated. Updating now...
    echo.
    call npm update --no-audit --no-fund
    if %ERRORLEVEL% NEQ 0 (
        echo  [WARN] Some packages could not be updated. Continuing anyway...
    ) else (
        echo  [OK] Packages updated successfully!
    )
)

:: -----------------------------------------------
:: STEP 5: Fetch latest code from GitHub
:: -----------------------------------------------
:FETCH_UPDATES
echo.
echo [5/5] Fetching latest code from GitHub...
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [WARN] Git is not installed. Skipping GitHub sync.
    echo  Download Git from: https://git-scm.com/download/win
) else (
    git pull origin main
    if %ERRORLEVEL% NEQ 0 (
        echo  [WARN] Could not pull from GitHub. You may be offline or there is a conflict.
        echo  Continuing with local version...
    ) else (
        echo  [OK] Code is up to date from GitHub.
    )
)

:: -----------------------------------------------
:: START THE SERVER
:: -----------------------------------------------
echo.
echo  ==========================================
echo   All checks passed! Starting the app...
echo  ==========================================
echo.
echo  The app will open at: http://localhost:5000
echo  Press Ctrl+C in this window to stop the server.
echo.

call npm run desktop:dev

echo.
echo  Server stopped.
pause

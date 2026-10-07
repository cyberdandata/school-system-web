@echo off
cd /d "%~dp0"
echo Starting Google Drive Backup Sync...

:: Check common Google Drive locations on Windows
set "DRIVE_DIR=%USERPROFILE%\Google Drive"
if not exist "%DRIVE_DIR%\" (
    set "DRIVE_DIR=G:\My Drive"
)

if exist "%DRIVE_DIR%\" (
    echo Google Drive folder found!
    echo Scanning Downloads for recent OTEC Database Exports...
    
    :: Find the most recently downloaded JSON backup
    for /f "delims=" %%I in ('dir /b /o:-d "%USERPROFILE%\Downloads\otec_data_audit*.json" 2^>nul') do (
        set "LATEST_BACKUP=%%I"
        goto :found
    )
    
    echo [Warning] No recent database exports found.
    echo Please click 'Export Data Audit (.json)' inside the App's Import/Export page first!
    goto :end

:found
    echo Found recent backup: %LATEST_BACKUP%
    
    :: Create a backup folder in Google Drive
    if not exist "%DRIVE_DIR%\OTEC_Backups\" mkdir "%DRIVE_DIR%\OTEC_Backups"
    
    :: Copy the file
    copy "%USERPROFILE%\Downloads\%LATEST_BACKUP%" "%DRIVE_DIR%\OTEC_Backups\" /Y
    echo [Success] Backup successfully synced to Google Drive!
    
) else (
    echo [Error] Google Drive Desktop application was not detected.
    echo Please install Google Drive for Desktop to use auto-sync.
)

:end
pause

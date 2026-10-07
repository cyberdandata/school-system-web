#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Google Drive Backup Sync..."

# Check common Google Drive locations on Mac
DRIVE_DIR="$HOME/Google Drive"
if [ ! -d "$DRIVE_DIR" ]; then
    DRIVE_DIR="$HOME/Library/CloudStorage/GoogleDrive-"
    # Resolve the first matched Google Drive path if it exists
    DRIVE_DIR=$(ls -d "$HOME/Library/CloudStorage/GoogleDrive-"* 2>/dev/null | head -1)
fi

if [ -n "$DRIVE_DIR" ] && [ -d "$DRIVE_DIR" ]; then
    echo "Google Drive folder found at: $DRIVE_DIR"
    echo "Scanning Downloads for recent OTEC Database Exports..."
    
    # Find the most recently downloaded JSON backup
    LATEST_BACKUP=$(ls -t "$HOME/Downloads/"otec_data_audit*.json 2>/dev/null | head -1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        echo "Found recent backup: $(basename "$LATEST_BACKUP")"
        
        # Create a backup folder in Google Drive
        mkdir -p "$DRIVE_DIR/My Drive/OTEC_Backups"
        
        # Copy the file
        cp "$LATEST_BACKUP" "$DRIVE_DIR/My Drive/OTEC_Backups/"
        echo "✅ Backup successfully synced to Google Drive!"
    else
        echo "⚠️ No recent database exports found."
        echo "Please click 'Export Data Audit (.json)' inside the App's Import/Export page first!"
    fi
else
    echo "❌ Google Drive Desktop application was not detected on this Mac."
    echo "Please install Google Drive for Desktop to use auto-sync."
fi

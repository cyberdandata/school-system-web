#!/usr/bin/env bash

echo "======================================="
echo "    OTEC Custom LAN Server Startup     "
echo "======================================="
echo ""

# Change to the directory where this script is located
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[INFO] Dependencies not found. Installing now..."
    echo ""
    npm install
    echo ""
    echo "[INFO] Installation complete!"
else
    echo "[INFO] Dependencies already installed. Skipping installation."
fi

echo "[INFO] Starting the server..."
echo ""
node server.js

const { app, BrowserWindow } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const isDev = !app.isPackaged;

if (isDev) {
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "School Management System",
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      webSecurity: false
    }
  });

  if (isDev || process.env.VITE_DEV_SERVER_URL) {
    // In development, load the Vite dev server
    mainWindow.loadURL('http://localhost:5000');
    // mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built HTML file
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  // Check for updates
  autoUpdater.checkForUpdatesAndNotify();

  if (process.platform === 'darwin') {
    try {
      app.dock.setIcon(path.join(__dirname, 'build', 'icon.png'));
    } catch (e) {
      console.error("Could not set dock icon:", e);
    }
  }
  
  try {
    createWindow();
  } catch (e) {
    console.error("Could not create window:", e);
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      try {
        createWindow();
      } catch(e) {}
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

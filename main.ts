import { app, BrowserWindow } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let serverProcess: any = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the frontend - try with relative path structure
  const indexPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
  console.log('Loading frontend from:', indexPath);
  
  // Check if the file exists
  if (!fs.existsSync(indexPath)) {
    console.error(`Frontend file not found at: ${indexPath}`);
    // Try an alternative path as fallback
    const altPath = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
    console.log('Trying alternative path:', altPath);
    
    if (fs.existsSync(altPath)) {
      mainWindow.loadFile(altPath);
    } else {
      // Create a simple HTML to display if nothing works
      const tempHtml = path.join(__dirname, 'temp.html');
      fs.writeFileSync(tempHtml, '<html><body><h1>Research Helper</h1><p>Could not load the application interface.</p></body></html>');
      mainWindow.loadFile(tempHtml);
    }
  } else {
    mainWindow.loadFile(indexPath);
  }

  // Open DevTools for debugging
  mainWindow.webContents.openDevTools();

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer() {
  // Start the Express server
  const serverPath = path.join(__dirname, 'backend', 'dist', 'server.js');
  console.log('Starting server from:', serverPath);
  
  // Check if file exists before trying to run it
  if (!fs.existsSync(serverPath)) {
    const altPath = path.join(__dirname, '..', 'backend', 'dist', 'server.js');
    console.error(`Server file not found at: ${serverPath}`);
    console.log('Trying alternative path:', altPath);
    
    if (fs.existsSync(altPath)) {
      serverProcess = spawn('node', [altPath]);
    } else {
      console.error('Could not find server file at alternate location either');
      return;
    }
  } else {
    serverProcess = spawn('node', [serverPath]);
  }

  // Fix the TypeScript error by adding proper type annotation
  serverProcess.stdout.on('data', (data: Buffer) => {
    console.log(`Server: ${data.toString()}`);
  });

  serverProcess.stderr.on('data', (data: Buffer) => {
    console.error(`Server error: ${data.toString()}`);
  });
}

// When Electron has finished initialization
app.whenReady().then(() => {
  console.log('Electron app ready, starting server and window');
  
  // Start backend server
  startServer();
  
  // Create main window
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Kill server process when app is quitting
app.on('quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
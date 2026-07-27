// electron/main.js
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // Crear la ventana principal
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/logo.png'),
    title: 'StockPro - Sistema de Gestión de Stock',
    backgroundColor: '#f5f6fa',
    show: false // Mostrar cuando esté lista
  });

  // Cargar la URL de tu aplicación
  const url = process.env.ELECTRON_START_URL || 'http://localhost:8080/login';
  mainWindow.loadURL(url);

  // Mostrar la ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Abrir enlaces externos en el navegador por defecto
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Menu personalizado
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Recargar',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.reload()
        },
        {
          label: 'Desarrollador',
          submenu: [
            {
              label: 'Abrir DevTools',
              accelerator: 'CmdOrCtrl+Shift+I',
              click: () => mainWindow.webContents.openDevTools()
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        {
          label: 'Pantalla Completa',
          accelerator: 'F11',
          click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen())
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Eventos de la ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Eventos de la aplicación
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Manejadores IPC
ipcMain.handle('get-version', () => {
  return app.getVersion();
});
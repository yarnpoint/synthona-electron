const path = require('path');
const { app, session, shell, globalShortcut, BrowserWindow, webContents } = require('electron');
const contextMenu = require('electron-context-menu');
// import config
const config = require('./config');

// prevent squirrel installer bug on windows that makes app start during installation
if (require('electron-squirrel-startup')) return app.quit();

let serverReady = false;
let electronReady = false;
let mainWindowCreated = false;
let windowList = [];

console.log('✔ creating server process');
const { fork } = require('child_process');
const serverProcess = fork(path.join(__dirname, './server/app.js'), ['args'], {
  env: {
    'ELECTRON_RUN_AS_NODE': '1',
    'PORT': config.SERVER_PORT,
    'APP_NAME': config.APP_NAME,
    'CLIENT_URL': 'http://' + config.CLIENT_BASE + ':' + config.CLIENT_PORT,
    'FRONTEND_DEV_MODE': config.CLIENT_PORT === config.SERVER_PORT,
    'JWT_SECRET': config.JWT_SECRET,
    'REFRESH_TOKEN_SECRET': config.REFRESH_TOKEN_SECRET,
    'PRODUCTION': 'false',
    'VERSION': config.VERSION,
  },
});

serverProcess.on('message', (message) => {
  if (message === 'server-started') {
    console.log('✔ started app');
    serverReady = true;
    if (serverReady && electronReady && mainWindowCreated) {
      windowList[0].reload();
    }
  } else {
    console.log(message);
  }
});

serverProcess.on('exit', (code, sig) => {
  // finishing`
  console.log('goodbye');
});

serverProcess.on('error', (error) => {
  console.log(error);
});

const mainWindow = () => {
  console.log('✔ creating window');
  // Create the browser window.
  let newWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: config.FULLSCREEN,
    webPreferences: {
      nodeIntegration: false,
      spellcheck: true,
      enableRemoteModule: false,
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
    },
    show: false,
  });
  // add it to the window list
  windowList.push(newWindow);
  // add the context menu
  contextMenu({
    prepend: (defaultActions, params, browserWindow) => [
      {
        label: 'emoji',
        click: () => {
          app.showEmojiPanel();
        },
      },
    ],
    labels: {
      copyImage: 'copy',
      paste: 'paste',
      copy: 'copy',
      cut: 'cut',
      inspect: 'inspect',
    },
    showSearchWithGoogle: false,
    showInspectElement: false,
  });
  // match the background color to the app theme
  newWindow.setBackgroundColor('#272727');
  // set the localhost URL for the app to load
  newWindow.loadURL('http://' + config.CLIENT_BASE + ':' + config.CLIENT_PORT);
  // set behaviour for opening a link in new tab
  newWindow.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    // open url in user's default browser
    shell.openExternal(url);
  });
  // mark window as created and electron as ready
  electronReady = true;
  mainWindowCreated = true;
  // show the window
  newWindow.show();
};
// disable hardware acceleration to prevent rendering bug
app.disableHardwareAcceleration();
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', mainWindow);
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  // register window shortcuts
  globalShortcut.register('CommandOrControl+E', () => {
    app.showEmojiPanel();
  });
  globalShortcut.register('CommandOrControl+H', () => {
    BrowserWindow.getFocusedWindow().loadURL('http://localhost:' + config.CLIENT_PORT);
  });
  globalShortcut.register('CommandOrControl+G', () => {
    BrowserWindow.getFocusedWindow().loadURL('http://localhost:' + config.CLIENT_PORT + '/graph');
  });
  // register the quickmen system
  registerQuickMenu();
  if (config.PRODUCTION) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': ["default-src 'self'; img-src *; object-src 'none';"],
        },
      });
    });
  }
});

app.on('before-quit', () => {
  console.log('before quit');
  serverProcess.kill('SIGINT');
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (/*BrowserWindow.getAllWindows().length === 0 && */ serverReady && electronReady) {
    mainWindow();
  }
});

registerQuickMenu = () => {
  // ===============================
  // bindings for quick menu
  // ===============================
  // 1 key
  let key1 = null;
  globalShortcut.register('CommandOrControl+1', () => {
    if (key1 !== null) {
      BrowserWindow.getFocusedWindow().loadURL(key1);
    }
  });
  globalShortcut.register('CommandOrControl+ALT+1', () => {
    key1 = BrowserWindow.getFocusedWindow().webContents.getURL();
  });
  // 2 key
  let key2 = null;
  globalShortcut.register('CommandOrControl+2', () => {
    if (key2 !== null) {
      BrowserWindow.getFocusedWindow().loadURL(key2);
    }
  });
  globalShortcut.register('CommandOrControl+ALT+2', () => {
    key2 = BrowserWindow.getFocusedWindow().webContents.getURL();
  });
  // 3 key
  let key3 = null;
  globalShortcut.register('CommandOrControl+3', () => {
    if (key3 !== null) {
      BrowserWindow.getFocusedWindow().loadURL(key3);
    }
  });
  globalShortcut.register('CommandOrControl+ALT+3', () => {
    key3 = BrowserWindow.getFocusedWindow().webContents.getURL();
  });
  // 4 key
  let key4 = null;
  globalShortcut.register('CommandOrControl+4', () => {
    if (key4 !== null) {
      BrowserWindow.getFocusedWindow().loadURL(key4);
    }
  });
  globalShortcut.register('CommandOrControl+ALT+4', () => {
    key4 = BrowserWindow.getFocusedWindow().webContents.getURL();
  });
  // 5 key
  let key5 = null;
  globalShortcut.register('CommandOrControl+5', () => {
    if (key5 !== null) {
      BrowserWindow.getFocusedWindow().loadURL(key5);
    }
  });
  globalShortcut.register('CommandOrControl+ALT+5', () => {
    key5 = BrowserWindow.getFocusedWindow().webContents.getURL();
  });
  // 6 key
  let key6 = null;
  globalShortcut.register('CommandOrControl+6', () => {
    if (key6 !== null) {
      BrowserWindow.getFocusedWindow().loadURL(key6);
    }
  });
  globalShortcut.register('CommandOrControl+ALT+6', () => {
    key6 = BrowserWindow.getFocusedWindow().webContents.getURL();
  });
  // 7 key
  let key7 = null;
  globalShortcut.register('CommandOrControl+7', () => {
    if (key7 !== null) {
      BrowserWindow.getFocusedWindow().loadURL(key7);
    }
  });
  globalShortcut.register('CommandOrControl+ALT+7', () => {
    key7 = BrowserWindow.getFocusedWindow().webContents.getURL();
  });
  // 8 key
  let key8 = null;
  globalShortcut.register('CommandOrControl+8', () => {
    if (key8 !== null) {
      BrowserWindow.getFocusedWindow().loadURL(key8);
    }
  });
  globalShortcut.register('CommandOrControl+ALT+8', () => {
    key8 = BrowserWindow.getFocusedWindow().webContents.getURL();
  });
  // 9 key
  let key9 = null;
  globalShortcut.register('CommandOrControl+9', () => {
    if (key9 !== null) {
      BrowserWindow.getFocusedWindow().loadURL(key9);
    }
  });
  globalShortcut.register('CommandOrControl+ALT+9', () => {
    key9 = BrowserWindow.getFocusedWindow().webContents.getURL();
  });
  // 0 key
  let key0 = null;
  globalShortcut.register('CommandOrControl+0', () => {
    if (key0 !== null) {
      BrowserWindow.getFocusedWindow().loadURL(key0);
    }
  });
  globalShortcut.register('CommandOrControl+ALT+0', () => {
    key0 = BrowserWindow.getFocusedWindow().webContents.getURL();
  });
};

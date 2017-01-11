const {app, BrowserWindow} = require('electron');

// keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected
let win;

function createWindow() {
  // create the browser window
  win = new BrowserWindow();
  win.maximize();

  // and load the index.html of the app
  win.loadURL(`file://${__dirname}/index.html`);

  // open the DevTools
  // win.webContents.openDevTools()

  // emitted when the window is closed
  win.on('closed', () => {
    // fereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element
    win = null;
  });
};

// yhis method will be called when Electron has finished
// initialization and is ready to create browser windows
// some APIs can only be used after this event occurs
app.on('ready', createWindow);

// quit when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // on macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open
  if (win === null) {
    createWindow();
  }
});

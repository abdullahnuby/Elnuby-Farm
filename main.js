const { app, BrowserWindow } = require('electron');

function createWindow(){
  const win = new BrowserWindow({
    width: 1460, height: 920,
    minWidth: 1100, minHeight: 700,
    title: 'المجدول — نظام إدارة مزرعة نخيل التمر',
    autoHideMenuBar: true
  });
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
import {app, BrowserWindow} from "electron";
import path from 'path';

console.time("start-timer")

app.on("ready", ()=>{
      const mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          devTools: false,
        },
       });
    mainWindow.maximize();
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
    console.timeEnd("start-timer")
    console.log("takla")
});


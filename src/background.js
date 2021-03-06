// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from 'path';
import url from 'url';
import { app, Menu, Tray } from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import createWindow from './helpers/window';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

const setApplicationMenu = () => {
    const menus = [editMenuTemplate];
    if (env.name !== 'production') {
        menus.push(devMenuTemplate);
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

let mainWindow = null;
let tray = null;
const setTrayMenu = () => {
    tray = new Tray(path.join(__dirname, '/assets/icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open',
            click: () => {
                mainWindow.show();
            }
        },
        {
            label: 'Quit',
            click: () => {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);
    tray.setToolTip('wpdivbek');
    tray.setContextMenu(contextMenu);
};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
    const userDataPath = app.getPath('userData');
    app.setPath('userData', `${userDataPath} (${env.name})`);
}

var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
        // mainWindow.restore();
        mainWindow.show();
    } 
    mainWindow.focus();
  }
});

if (shouldQuit) {

  app.quit();
} else {

    app.on('ready', () => {
        setApplicationMenu();
        setTrayMenu();

        mainWindow = createWindow('main', {
            width: 1000,
            height: 600,
        });

        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'app.html'),
            protocol: 'file:',
            slashes: true,
        }));

        mainWindow.on('minimize', function(event) {
            event.preventDefault()
            mainWindow.hide();
        });

        mainWindow.on('close', function(event) {
            if (!app.isQuiting) {
                event.preventDefault()
                mainWindow.hide();
            }
            return false;
        });

        if (env.name === 'development') {
            mainWindow.openDevTools();
        }
    });

    app.on('window-all-closed', () => {
        app.quit();
    });
}
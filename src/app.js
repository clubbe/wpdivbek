import limit from 'limit-framework';
import COMPONENTS from './components/index';

limit.Logger.useDefaults();
limit.Logger.setLevel(limit.Logger.INFO);

limit.setViewModelRenderer((view, model) => {
    let html = Mustache.render(view, model || {});
    return html;
});

limit.registerComponents(COMPONENTS);

document.body.ondragover = () => {
    return false;
};
document.body.ondragleave = () => {
    return false;
};
document.body.ondragend = () => {
    return false;
};
document.body.ondrop = (e) => {
    e.preventDefault();
    limit.EVENTS.emit('files:dropped', e.dataTransfer.files);
    return false;
};

console.log(localStorage);

// let menu = document.createElement('ui-menu');
// console.log('menu = ', menu);

// Here is the starting point for your application code.

// // Small helpers you might want to keep
// import './helpers/context_menu.js';
// import './helpers/external_links.js';

// // All stuff below is just to show you how it works. You can delete all of it.
// import { remote } from 'electron';
// import jetpack from 'fs-jetpack';
// import { greet } from './hello_world/hello_world';
// import env from './env';

// const app = remote.app;
// const appDir = jetpack.cwd(app.getAppPath());

// // Holy crap! This is browser window with HTML and stuff, but I can read
// // here files form disk like it's node.js! Welcome to Electron world :)
// const manifest = appDir.read('package.json', 'json');

// const osMap = {
//   win32: 'Windows',
//   darwin: 'macOS',
//   linux: 'Linux',
// };

// document.querySelector('#greet').innerHTML = greet();
// document.querySelector('#os').innerHTML = osMap[process.platform];
// document.querySelector('#author').innerHTML = manifest.author;
// document.querySelector('#env').innerHTML = env.name;
// document.querySelector('#electron-version').innerHTML = process.versions.electron;

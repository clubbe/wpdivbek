import fs from 'fs';
import homedir from 'homedir';
import path from 'path';
import dateFormat from 'dateformat';

const dir = path.join(homedir(), '.wpdivbek');
const dirReport = path.join(dir, 'reports');

function file() {

  if (fs.existsSync(dir) === false) {
    fs.mkdirSync(dir);
  }

  if (fs.existsSync(dirReport) === false) {
    fs.mkdirSync(dirReport);
  }

  const file = path.join(dirReport, `${dateFormat(new Date(), 'yyyymmdd')}.txt`);
  if (fs.existsSync(file) === false) {
    fs.writeFileSync(file, '');
  }

  return file;
}

function now() {
  return dateFormat(new Date(), 'isoDateTime');
}

export class Report {

  static log(type, state, note) {
    fs.appendFileSync(file(), `[${now()}] ${type} ${state} ${note}\r\n`);
  }
}
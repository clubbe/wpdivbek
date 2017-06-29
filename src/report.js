import fs from 'fs';
import homedir from 'homedir';
import path from 'path';
import dateFormat from 'dateformat';

const dir = path.join(homedir(), '.wpdivbek');
const dirReport = path.join(dir, 'reports');

function file(fileName) {
  if (fs.existsSync(dir) === false) {
    fs.mkdirSync(dir);
  }
  if (fs.existsSync(dirReport) === false) {
    fs.mkdirSync(dirReport);
  }
  return path.join(dirReport, `${fileName}.txt`);
}

function date() {
  return new Date();
}

function now(date) {
  return dateFormat(date, 'isoDateTime');
}

function today(date) {
  return dateFormat(date, 'yyyymmdd');
}

let REPORT = {
  date: undefined,
  file: undefined
};

export class Report {

  static log(type, label, state, note) {
    const date = date();
    const today = today(date);
    const now = now(date);
    if (!REPORT.file || REPORT.date !== today) {
      REPORT.file = file(today);
      REPORT.date = today;
    }
    fs.appendFileSync(REPORT.file, `[${now}] ${type} ${label} ${state} ${note}\r\n`);
  }
}
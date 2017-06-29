import limit from 'limit-framework';
import fs from 'fs';
import homedir from 'homedir';
import path from 'path';
import dateFormat from 'dateformat';

const LOG = limit.Logger.get('Report');

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
    const date = new ReportDate();
    if (!REPORT.file || REPORT.date !== date.today) {
      REPORT.file = file(date.today);
      REPORT.date = date.today;
    }
    fs.appendFileSync(REPORT.file, `[${date.now}] ${type} ${label} ${state} ${note}\r\n`);
  }
}

class ReportDate {

  constructor() {
    this.date = new Date();
  }

  get now() {
    return dateFormat(this.date, 'isoDateTime');
  }

  get today() {
    return dateFormat(this.date, 'yyyymmdd');
  }
}
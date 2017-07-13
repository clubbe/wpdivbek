import fs from 'fs';
import path from 'path';
import homedir from 'homedir';

const dirName = '.wpdivbek';
const dir = path.join(homedir(), dirName);
const file = path.join(dir, 'versions.json');

let MAP = open();
// console.log('VERSIONS > MAP = ', MAP);

export class VERSIONS {

  static get dirName() {
    return dirName;
  }

  static get dir() {
    return dir;
  }

  static get file() {
    return file;
  }

  static get key() {
    return '.wpdivbek/versions.json';
  }

  static reload() {
    MAP = open();
  }

  static has(id) {
    return MAP.has(id);
  }

  static put(id, file) {
    return new Promise((resolve, reject) => {
      if (this.has(id)) {
        reject(new Error('must be unique'));
        return;
      }
      this.set(id, file).then((record) => { resolve(record) });
    });
  }

  static get values() {
    return Array.from(MAP.values());
  }

  static get(id) {
    return new Promise((resolve, reject) => {
      if (!this.has(id)) {
        reject(new Error('must exist'));
        return;
      }
      resolve(Object.assign({}, MAP.get(id)));
    });
  }

  static set(id, file) {
    return new Promise((resolve) => {
      let record = Object.assign({}, file);
      MAP.set(id, record);
      flush();
      resolve(record);
    });
  }

  static delete(id) {
    MAP.delete(id);
    flush();
  }

  static find(id, key, date) {
    return new Promise((resolve, reject) => {
      this.get(id)
        .then((records) => {
          let result = null;
          for (let prop in records) {
            let record = records[prop];
            if (record[key]) {
              result = record[key];
            }
            if (prop === date) {
              break;
            }
          }
          resolve(result);
        })
        .catch(reject);
    });
  }

  static findAll(id, date) {
    return new Promise((resolve, reject) => {
      this.get(id)
        .then((records) => {
          const result = {};
          for (let prop in records) {
            let record = records[prop];
            for (let key in record) {
              result[key] = record[key];
            }
            if (prop === date) {
              break;
            }
          }
          const results = [];
          for (let key in result) {
            results.push({ key, data: result[key] });
          }
          resolve(results);
        })
        .catch(reject);
    });
  }
}

function open() {
  if (fs.existsSync(file)) {
    let data = fs.readFileSync(file, { encoding: 'utf8' });
    data = JSON.parse(data);
    return new Map(data);
  } else {
    return new Map();
  }
}

function flush() {
  let data = JSON.stringify([...MAP], null, 2);
  // console.log('VERSIONS > flush > data = ', data);
  fs.writeFileSync(file, data);
}
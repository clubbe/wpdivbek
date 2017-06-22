import fs from 'fs';
import homedir from 'homedir';
import path from 'path';

const dir = path.join(homedir(), '.wpdivbek');
const file = path.join(homedir(), '.wpdivbek', 's3.conf');

export class Conf {

  constructor() {

    //This looks if the file is created and if not then creates the file in the users home dir
    if (fs.existsSync(dir) === false) {
        console.log('Creating dir');
        fs.mkdirSync(dir);
    }
    // This will create a config file where you will put in your AWS credentials
    if (fs.existsSync(file) === false) {
        console.log('Creating config file');
      fs.writeFileSync(file, 'id=your_AWS_accessKeyId\r\nkey=your_AWS_secretAccessKey');
    }

    let data = fs.readFileSync(file, { encoding: 'utf8' });
    let rows = data.split('\r\n');
    let conf = {};
    for (let i = 0; i < rows.length; i++) {
      let row = rows[i];
      let props = row.split('=');
      this[props[0]] = props[1];
    }
  }
}

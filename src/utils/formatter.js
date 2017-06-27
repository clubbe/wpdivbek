const SIZES = ['b', 'kb', 'Mb', 'Gb', 'Tb'];

export class Formatter {

  static formatSize(value) {
    let size;
    if (!value) {
      size = value + ` ${SIZES[0]}`;
    } else {
      let s = 0;
      let i = SIZES.length - 1;
      while (s === 0) {
        size = (value / (Math.pow(1024, i--))).toFixed(2);
        s = Math.floor(size);
        if (s !== 0) {
          size = size + ` ${SIZES[i + 1]}`;
        }
      }
    }
    return size;
  }

  static formatSizeToUnit(value, unit) {
    let size;
    if (!value) {
      size = value;
    } else {
      let s = 0;
      let i = SIZES.length - 1;
      while (unit !== SIZES[i + 1]) {
        size = (value / (Math.pow(1024, i--))).toFixed(2);
      }
    }
    return size;
  }

  static formatTime(value) {
    let split = value.split(' ');
    return `${split[0]} ${split[1]} ${split[2]} ${split[3]} ${split[4]}`;
  }
}
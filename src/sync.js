import limit from 'limit-framework';
import path from 'path';
import dateFormat from 'dateformat';
import { Formatter } from './utils/formatter';
import { LOADER } from './loader';
import { S3Connector, S3Parameters } from './utils/connector';
import queue from 'queue';

const LOG = limit.Logger.get('Sync');
const CONNECTER = new S3Connector();

export class Sync {

  static backup(folders, bucket) {
    const reporter = new ProgressReporter(folders);
    const q = queue({ concurrency: 1 });
    let count = 0;
    for (let folder of folders) {
      const dir = folder.absolutePath;
      const prefix = makePrefix(dir);
      q.push((cb) => {
        count++;
        const callback = (err, result) => {
          cb(err, result);
          return null;
        };
        CONNECTER.upload( //
          buildSyncParams(dir, bucket, prefix), //
          (progressAmount) => { reporter.uploadProgress(dir, progressAmount, count); }
        ) //
          .then(() => { return callback(); })
          .catch((err) => { callback(err); });
      });
    }
    q.start((err) => {
      LOADER.loading = false;
      limit.EVENTS.emit('backup:completed', bucket);
    });
  }

  static restore(folder, bucket, prefix) {
    const reporter = new ProgressReporter();
    const callback = (err, result) => {
      if (err) LOG.error('unable to restore:', err.stack);
      LOADER.loading = false;
      return null;
    };
    CONNECTER.download( //
      buildSyncParams(folder, bucket, prefix), //
      (progressAmount, progressTotal) => {
        reporter.downloadProgress(progressAmount, progressTotal);
      }
    ) //
      .then(() => { return callback(); })
      .catch((err) => { callback(err); });
  }

  static list(bucket) {
    return CONNECTER.list(buildListParams(bucket, '/', 10));
  }
}

function makePrefix(dir) {
  let temp = dir.split(path.sep);
  let dirs = [dateFormat(new Date(), 'yyyymmdd')];
  for (let dir of temp) {
    if (dir.indexOf(':') === -1) {
      dirs.push(dir);
    }
  }
  return dirs.join('/');
}

function buildSyncParams(dir, bucket, prefix) {
  return new S3Parameters.Builder() //
    .localDir(dir) //
    .s3Params({
      Bucket: bucket,
      Prefix: prefix
    }) //
    .build();
}

function buildListParams(bucket, delimiter, maxKeys) {
  return new S3Parameters.Builder() //
    .s3Params({
      Bucket: bucket,
      Delimiter: delimiter,
      MaxKeys: maxKeys
    }) //
    .build();
}

class ProgressReporter {

  constructor(files) {
    if (files) {
      this.total = 0;
      this.progress = {};
      this.totalCount = files.length;
      for (let file of files) {
        this.total += file.sizeInBytes;
        this.progress[file.absolutePath] = 0;
      }
    }
  }

  uploadProgress(key, amount, count) {
    if (!amount) {
      if (!this.idle) {
        this.idle = true;
        LOADER.loading = 'Calculating';
      }
    } else {
      if (this.idle) {
        this.idle = false;
        LOADER.loading = 'Uploading';
      }
    }
    this.progress[key] = amount;
    let totalProgress = this.totalProgress;
    let progress = this.total ? totalProgress / this.total * 100 : 0;
    let formattedProgress = Formatter.formatSizeToUnit(totalProgress, 'Mb');
    let formattedTotal = Formatter.formatSizeToUnit(this.total, 'Mb');
    let message = `${Math.round(progress)}% (${formattedProgress}/${formattedTotal}Mb)`;
    if (count !== undefined) {
      message = `${count}/${this.totalCount} - ${message}`;
    }
    LOADER.progress(message);
  }

  downloadProgress(amount, total) {
    if (!amount) {
      if (!this.idle) {
        this.idle = true;
        LOADER.loading = 'Calculating';
      }
    } else {
      if (this.idle) {
        this.idle = false;
        LOADER.loading = 'Downloading';
      }
    }
    let progress = total ? amount / total * 100 : 0;
    let formattedProgress = Formatter.formatSizeToUnit(amount, 'Mb');
    let formattedTotal = Formatter.formatSizeToUnit(total, 'Mb');
    let message = `${Math.round(progress)}% (${formattedProgress}/${formattedTotal}Mb)`;
    LOADER.progress(message);
  }

  get totalProgress() {
    let totalProgress = 0;
    for (let prop in this.progress) {
      totalProgress += this.progress[prop];
    }
    return totalProgress;
  }
}
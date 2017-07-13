import limit from 'limit-framework';
import path from 'path';
import dateFormat from 'dateformat';
import { Formatter } from './utils/formatter';
import { LOADER } from './loader';
import { S3Connector, S3Parameters } from './utils/connector';
import queue from 'queue';
import { VERSIONS } from './resources/versions';

const LOG = limit.Logger.get('Sync');
const CONNECTER = new S3Connector();

export class Sync {

  static backup(folders, bucket) {
    const reporter = new ProgressReporter(folders);
    const store = new VersionStore(bucket);
    const q = queue({ concurrency: 1 });
    let count = 0;
    for (let folder of folders) {
      q.push((cb) => {
        count++;
        const callback = (err, result) => {
          cb(err, result);
          return null;
        };
        const dir = folder.absolutePath;
        uploadFolder(
          buildSyncParams(dir, bucket, makePrefix(dir)),
          (progress) => { reporter.uploadProgress(dir, progress, count); },
          (key, tag, version, size) => { store.write(key, tag, version, size); }
        )
          .then(() => { return callback(); })
          .catch((err) => { callback(err); });
      });
    }
    q.start((err) => {
      const callback = (err, result) => {
        LOADER.loading = false;
        limit.EVENTS.emit('backup:completed', bucket);
        return null;
      };
      if (err) {
        LOG.error('backup > err = ', err);
        return callback();
      }
      const preCondition = (localFile, s3Object, cb) => {
        if (VERSIONS.file === localFile) cb(null, {});
        else cb(null, null);
      };
      const dir = VERSIONS.dir;
      uploadFolder(
        buildConditionalSyncParams(dir, bucket, VERSIONS.dirName, preCondition),
        (progress) => { reporter.uploadProgress(dir, progress); }
      )
        .then(() => { return callback(); })
        .catch((err) => { callback(err); });
    });
  }

  static restore(folder, bucket, time) {
    const reporter = new ProgressReporter();
    const callback = (err, result) => {
      if (err) LOG.error('unable to restore:', err.stack);
      LOADER.loading = false;
      return null;
    };
    const params = buildSyncParams(folder, bucket, '');
    params.getS3Params = (localFile, s3Object, cb) => {
      if (VERSIONS.key === s3Object.Key) {
        cb(null, null);
        return;
      }
      VERSIONS.find(bucket, s3Object.Key, time)
        .then((version) => { cb(null, version ? { VersionId: version.version } : null); })
        .catch(cb);
    };
    VERSIONS.findAll(bucket, time)
      .then((results) => {
        params.allS3Objects = [];
        for (let result of results) {
          params.allS3Objects.push({
            Key: result.key,
            ETag: result.data.tag,
            Size: result.data.size,
            key: result.key
          });
        }
        CONNECTER.download(
          params,
          (progressAmount, progressTotal) => { reporter.downloadProgress(progressAmount, progressTotal); }
        )
          .then(() => { return callback(); })
          .catch((err) => { callback(err); });
      });
  }

  static list(bucket) {
    return new Promise((resolve, reject) => {
      LOADER.loading = true;
      const callback = () => {
        VERSIONS.reload();
        return VERSIONS.get(bucket)
          .then((record) => {
            LOADER.loading = false;
            let results = [];
            for (let prop in record) {
              results.push(prop);
            }
            resolve(results.reverse());
          })
          .catch((err) => {
            LOADER.loading = false;
            reject(err);
          });
      };
      CONNECTER
        .download(buildSyncParams(VERSIONS.dir, bucket, VERSIONS.dirName))
        .then(callback)
        .catch(callback);
    });
  }

  static clear(bucket) {
    return new Promise((resolve, reject) => {
      LOADER.loading = true;
      CONNECTER.empty({ Bucket: bucket })
        .then(() => {
          LOADER.loading = false;
          resolve();
        })
        .catch((err) => {
          LOADER.loading = false;
          reject(err);
        });
    });
  }
}

function uploadFolder(params, uploadProgressedCallback, fileCompletedCallback) {
  return CONNECTER.upload(
    params,
    (progressAmount) => { uploadProgressedCallback(progressAmount); },
    (data, localFileStat, fullPath, fullKey) => { fileCompletedCallback && fileCompletedCallback(fullKey, data.ETag, data.VersionId, localFileStat.size); }
  );
}

function makePrefix(dir) {
  let temp = dir.split(path.sep);
  let dirs = [];
  for (let dir of temp) {
    if (dir.indexOf(':') === -1) {
      dirs.push(dir);
    }
  }
  return dirs.join('/');
}

function buildSyncParams(dir, bucket, prefix) {
  return new S3Parameters.Builder()
    .localDir(dir)
    .s3Params({ Bucket: bucket, Prefix: prefix })
    .build();
}

function buildConditionalSyncParams(dir, bucket, prefix, getS3Params) {
  return new S3Parameters.Builder()
    .localDir(dir)
    .s3Params({ Bucket: bucket, Prefix: prefix })
    .getS3Params(getS3Params)
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

    let bps = 0;
    if (amount > 0) {
      let timeInMillis = new Date().getTime();
      let durationInMillis = 0;
      if (this.previousTimeInMillis) {
        durationInMillis = timeInMillis - this.previousTimeInMillis;
      } else {
        this.previousTimeInMillis = timeInMillis;
        this.previousTotalProgress = totalProgress;
      }
      if (durationInMillis >= 1000) {
        let progressDifference = totalProgress - this.previousTotalProgress;
        bps = progressDifference * (1000 / durationInMillis);
        this.previousTimeInMillis = timeInMillis;
        this.previousTotalProgress = totalProgress;
      }
    }

    let progress = this.total ? totalProgress / this.total * 100 : 0;
    let formattedProgress = Formatter.formatSizeToUnit(totalProgress, 'Mb');
    let formattedTotal = Formatter.formatSizeToUnit(this.total, 'Mb');
    let message = `${Math.round(progress)}% (${formattedProgress}/${formattedTotal}Mb)`;
    if (count !== undefined) {
      message = `${count}/${this.totalCount} - ${message}`;
    }
    if (!this.mbps) {
      this.mbps = '0.00';
    }
    if (bps > 0) {
      this.mbps = (bps / 1024 / 1024).toFixed(2);
    }
    message = `${message} @ ${this.mbps}Mb/s`;
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

class VersionStore {

  constructor(ns) {
    this.ns = ns;
    this.date = dateFormat(new Date(), 'isoDateTime');
    if (!VERSIONS.has(this.ns)) VERSIONS.put(this.ns, {});
  }

  write(key, tag, version, size) {
    VERSIONS.get(this.ns)
      .then((record) => {
        let data = record[this.date];
        if (!data) {
          record[this.date] = data = {};
        }
        data[key] = { tag, version, size };
        VERSIONS.set(this.ns, record);
      });
  }
}
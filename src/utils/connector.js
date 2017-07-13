import limit from 'limit-framework';
import s3 from 's3';
import { CONF } from '../conf';
import { Report } from '../report';

const LOG = limit.Logger.get('S3Connector');

export class S3Connector {

  constructor() {
    this.client = s3.createClient({
      s3Options: {
        accessKeyId: CONF.id,
        secretAccessKey: CONF.key
      },
    });
  }

  upload(params, progressCallback, fileCompletedCallback) {
    return new Promise((resolve, reject) => {
      Report.log('upload', params.s3Params.Bucket, 'start', params.localDir);
      const worker = this.client.uploadDir(params);
      const end = () => {
        Report.log('upload', params.s3Params.Bucket, 'end', `${params.localDir}`);
        resolve();
      }
      const error = (err) => {
        Report.log('upload', params.s3Params.Bucket, 'error', `${params.localDir} : ${err}`);
        reject(err);
      }
      const progress = () => {
        progressCallback(worker.progressAmount);
      }
      worker.on(this.EVENT_NAMES.FILE_UPLOAD_END, (data, localFileStat, fullPath, fullKey) => {
        fileCompletedCallback(data, localFileStat, fullPath, fullKey);
      });
      this.registerEvents(worker, end, error, progress);
      return worker;
    });
  }

  download(params, progressCallback) {
    return new Promise((resolve, reject) => {
      const worker = this.client.downloadDir(params);
      const progress = () => {
        progressCallback && progressCallback(worker.progressAmount, worker.progressTotal);
      };
      this.registerEvents(worker, resolve, reject, progress);
      return worker;
    });
  }

  versions(params) {
    return new Promise((resolve, reject) => {
      this.client.s3.listObjectVersions(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  empty(params) {
    const toDeleteObjects = (objects) => {
      const results = [];
      for (let object of objects) {
        results.push({ Key: object.Key, VersionId: object.VersionId });
      }
      return results;
    };
    return new Promise((resolve, reject) => {
      return this.versions(params)
        .then((data) => {
          let deleteList = toDeleteObjects(data.DeleteMarkers);
          deleteList = deleteList.concat(toDeleteObjects(data.Versions));
          this.client.s3.deleteObjects({ Bucket: params.Bucket, Delete: { Objects: deleteList } }, (err, data) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(data);
          });
        })
        .catch(reject);
    });
  }

  registerEvents(emitter, end, error, progress) {
    emitter.on(this.EVENT_NAMES.END, () => { end(); });
    emitter.on(this.EVENT_NAMES.ERROR, (err) => { error(err); });
    emitter.on(this.EVENT_NAMES.PROGRESS, () => { progress(); });
  }

  get EVENT_NAMES() {
    return {
      END: 'end',
      DATA: 'data',
      ERROR: 'error',
      PROGRESS: 'progress',
      FILE_UPLOAD_START: 'fileUploadStart',
      FILE_UPLOAD_END: 'fileUploadEnd'
    };
  }
}

export class S3Parameters {

  constructor() {
    this.params = {};
  }

  set localDir(localDir) {
    this.params.localDir = localDir;
  }

  get localDir() {
    return this.params.localDir;
  }

  set s3Params(s3Params) {
    this.params.s3Params = s3Params;
  }

  get s3Params() {
    return this.params.s3Params;
  }

  set getS3Params(getS3Params) {
    this.params.getS3Params = getS3Params;
  }

  get getS3Params() {
    return this.params.getS3Params;
  }

  static get Builder() {

    return class ParametersBuilder {

      constructor() {
        this.parameters = new S3Parameters();
      }

      localDir(localDir) {
        this.parameters.localDir = localDir;
        return this;
      }

      s3Params(s3Params) {
        this.parameters.s3Params = s3Params;
        return this;
      }

      getS3Params(getS3Params) {
        this.parameters.getS3Params = getS3Params;
        return this;
      }

      build() {
        return this.parameters;
      }
    }
  }
}
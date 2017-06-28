import limit from 'limit-framework';
import s3 from 's3';
import path from 'path';
import { CONF } from './conf';
import dateFormat from 'dateformat';
import { Formatter } from './utils/formatter';
import { Report } from './report';

const LOG = limit.Logger.get('Sync');

export class Sync {

    static backup(backup, bucket) {
        const folders = backup.files;
        const reporter = new ProgressReporter(folders);
        let count = folders.length;
        for (let folder of folders) {
            let temp = folder.absolutePath.split(path.sep);
            let dirs = [dateFormat(new Date(), 'yyyymmdd')];
            for (let dir of temp) {
                if (dir.indexOf(':') === -1) {
                    dirs.push(dir);
                }
            }
            let prefix = dirs.join('/');
            let params = {
                localDir: folder.absolutePath,
                s3Params: {
                    Bucket: bucket,
                    Prefix: prefix
                }
            };
            Report.log('backup', 'start', folder.absolutePath);
            let uploader = s3Client().uploadDir(params);
            uploader.on('error', (err) => {
                Report.log('backup', 'error', `${folder.absolutePath} : ${err}`);
                LOG.error('unable to backup:', err.stack);
            });
            uploader.on('progress', () => {
                reporter.reportProgress(folder.absolutePath, uploader.progressAmount);
            });
            uploader.on('end', () => {
                Report.log('backup', 'end', `${folder.absolutePath}`);
                if (--count === 0) {
                    limit.EVENTS.emit('backup:completed', bucket);
                }
            });
            uploader.on('fileUploadStart', (localFilePath) => {
                Report.log('backup', 'file:start', `${folder.absolutePath} : ${localFilePath}`);
            });
            uploader.on('fileUploadEnd', (localFilePath) => {
                Report.log('backup', 'file:end', `${folder.absolutePath} : ${localFilePath}`);
            });
        }
    }

    static restore(folder, bucket, prefix) {
        let params = {
            localDir: folder,
            s3Params: {
                Bucket: bucket,
                Prefix: prefix
            }
        };
        let downloader = s3Client().downloadDir(params);
        downloader.on('error', (err) => {
            LOG.error('unable to restore:', err.stack);
        });
        downloader.on('progress', () => {
            let progress = downloader.progressTotal ? downloader.progressAmount / downloader.progressTotal * 100 : 0;
            progress = `${Math.round(progress)}% (${Math.round(downloader.progressAmount / 1024 / 1024)}/${Math.round(downloader.progressTotal / 1024 / 1024)}Mb)`;
            limit.EVENTS.emit('progress:updated', progress);
        });
        downloader.on('end', () => {
            limit.EVENTS.emit('restore:completed', bucket);
        });
    }

    static list(bucket) {
        return new Promise((resolve, reject) => {
            let params = {
                s3Params: {
                    Bucket: bucket,
                    Delimiter: '/',
                    MaxKeys: 10
                }
            };
            let lister = s3Client().listObjects(params);
            lister.on('error', (err) => {
                reject(err);
            });
            lister.on('data', (data) => {
                let result = [];
                for (let prefix of data.CommonPrefixes) {
                    result.push(prefix.Prefix);
                }
                resolve(result);
            });
        });
    }
}

function s3Client() {
    return s3.createClient({
        s3Options: {
            accessKeyId: CONF.id,
            secretAccessKey: CONF.key
        },
    });
}

class ProgressReporter {

    constructor(files) {
        this.total = 0;
        this.progress = {};
        for (let file of files) {
            this.total += file.sizeInBytes;
            this.progress[file.absolutePath] = 0;
        }
    }

    reportProgress(key, amount) {
        this.progress[key] = amount;
        let totalProgress = this.totalProgress;
        let progress = this.total ? totalProgress / this.total * 100 : 0;
        let formattedTotal = Formatter.formatSize(this.total);
        let formattedProgress = Formatter.formatSizeToUnit(totalProgress, formattedTotal.split(' ')[1]);
        limit.EVENTS.emit('progress:updated', `${Math.round(progress)}% (${formattedProgress}/${formattedTotal})`);
    }

    get totalProgress() {
        let totalProgress = 0;
        for (let prop in this.progress) {
            totalProgress += this.progress[prop];
        }
        return totalProgress;
    }
}

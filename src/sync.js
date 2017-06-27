import limit from 'limit-framework';
import s3 from 's3';
import path from 'path';
import { CONF } from './conf';
import dateFormat from 'dateformat';

const LOG = limit.Logger.get('Sync');

export class Sync {

    static backup(backup, bucket) {
        let folders = backup.files;
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
            let uploader = s3Client().uploadDir(params);
            uploader.on('error', (err) => {
                LOG.error('unable to backup:', err.stack);
            });
            uploader.on('progress', () => {
                let progress = uploader.progressTotal ? uploader.progressAmount / uploader.progressTotal * 100 : 0;
                progress = `${Math.round(progress)}% (${Math.round(uploader.progressAmount / 1024 / 1024)}/${Math.round(uploader.progressTotal / 1024 / 1024)}Mb)`;
                limit.EVENTS.emit('progress:updated', progress);
            });
            uploader.on('end', () => {
                if (--count === 0) {
                    limit.EVENTS.emit('backup:completed', bucket);
                }
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

import limit from 'limit-framework';
import s3 from 's3';
import homedir from 'homedir';
import fs from 'fs';
import path from 'path';
import { CONF } from './conf';
import dateFormat from 'dateformat';

const LOG = limit.Logger.get('Sync');

export class Sync {

    // TODO(CL): convert to promise - fix references
    static backup(backup, bucket) {
        let folders = backup.files;
        for (let folder of folders) {
            let params = {
                localDir: folder.absolutePath,
                s3Params: {
                    Bucket: bucket,
                    Prefix: dateFormat(new Date(), 'yyyymmdd')
                }
            };
            let uploader = s3Client().uploadDir(params);
            uploader.on('error', (err) => {
                LOG.info('unable to backup:', err.stack);
            });
            uploader.on('progress', () => {
                LOG.info('progress', uploader.progressAmount, uploader.progressTotal);
                let progress = uploader.progressTotal ? uploader.progressAmount / uploader.progressTotal * 100 : 0;
                progress = `${Math.round(progress)}% (${Math.round(uploader.progressAmount/1024/1024)}/${Math.round(uploader.progressTotal/1024/1024)}Mb)`;
                limit.EVENTS.emit('progress:updated', progress);
            });
            uploader.on('end', () => {
                LOG.info('done uploading');
                limit.EVENTS.emit('backup:completed', bucket);
            });
        }
    }

    // TODO(CL): convert to promise - fix references
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
            LOG.info('unable to restore:', err.stack);
        });
        downloader.on('progress', () =>{
            LOG.info('progress', downloader.progressAmount, downloader.progressTotal);
            let progress = downloader.progressTotal ? downloader.progressAmount / downloader.progressTotal * 100 : 0;
            progress = `${Math.round(progress)}% (${Math.round(downloader.progressAmount/1024/1024)}/${Math.round(downloader.progressTotal/1024/1024)}Mb)`;
            limit.EVENTS.emit('progress:updated', progress);
        });
        downloader.on('end', () => {
            LOG.info('done downloading');
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
            LOG.info('list > params = ', params);
            let lister = s3Client().listObjects(params);
            lister.on('error', (err) => {
                LOG.info('unable to list:', err.stack);
                reject(err);
            });
            lister.on('data', (data) => {
                LOG.info('data = ', data);
                let result = [];
                for (let prefix of data.CommonPrefixes) {
                    result.push(prefix.Prefix);
                }
                resolve(result);
            });
            lister.on('progress', () => {
                LOG.info('progress', lister.progressAmount, lister.progressTotal);
            });
            lister.on('end', () => {
                LOG.info('done listing');
            });
        });
    }
}

function s3Client() {
    LOG.info('s3Client > conf = ', CONF);
    return s3.createClient({
        s3Options: {
            accessKeyId: CONF.id,
            secretAccessKey: CONF.key
        },
    });
}

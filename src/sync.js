import limit from 'limit-framework';
import s3 from 's3';
import homedir from 'homedir';
import fs from 'fs';
import path from 'path';
import { CONF } from './conf';
import dateFormat from 'dateformat';

const LOG = limit.Logger.get('Sync');

export class Sync {

    static backup(backup, bucket, callback) {
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
            uploader.on('error', function (err) {
                LOG.info('unable to backup:', err.stack);
            });
            uploader.on('progress', function () {
                LOG.info('progress', uploader.progressAmount, uploader.progressTotal);
            });
            uploader.on('end', function () {
                LOG.info('done uploading');
                callback && callback();
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
        downloader.on('error', function (err) {
            LOG.info('unable to restore:', err.stack);
        });
        downloader.on('progress', function () {
            LOG.info('progress', downloader.progressAmount, downloader.progressTotal);
        });
        downloader.on('end', function () {
            LOG.info('done downloading');
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
            lister.on('error', function (err) {
                LOG.info('unable to list:', err.stack);
                reject(err);
            });
            lister.on('data', function (data) {
                LOG.info('data = ', data);
                let result = [];
                for (let prefix of data.CommonPrefixes) {
                    result.push(prefix.Prefix);
                }
                resolve(result);
            });
            lister.on('progress', function () {
                LOG.info('progress', lister.progressAmount, lister.progressTotal);
            });
            lister.on('end', function () {
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

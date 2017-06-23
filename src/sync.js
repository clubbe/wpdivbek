import limit from 'limit-framework';
import s3 from 's3';
import homedir from 'homedir';
import fs from 'fs';
import path from 'path';
import { Conf } from './conf';

const LOG = limit.Logger.get('Sync');

let conf = new Conf();

const client = s3.createClient({
    s3Options: {
        accessKeyId: conf.id,
        secretAccessKey: conf.key
    },
});

export class Sync {

    static backup(backup) {
        let folders = backup.files;
        for (let folder of folders) {
            let params = {
                localDir: folder.absolutePath,
                s3Params: {
                    Bucket: "zailabbackups",
                    Prefix: "20170524/"
                },
            };
            let uploader = client.uploadDir(params);
            uploader.on('error', function (err) {
                LOG.info("unable to backup:", err.stack);
            });
            uploader.on('progress', function () {
                LOG.info("progress", uploader.progressAmount, uploader.progressTotal);
            });
            uploader.on('end', function () {
                LOG.info("done uploading");
            });
        }
    }

    static restore(folder) {
        let params = {
            localDir: folder,
            s3Params: {
                Bucket: "zailabbackups",
                Prefix: "20170524/"
            },
        };
        let downloader = client.downloadDir(params);
        downloader.on('error', function (err) {
            LOG.info("unable to restore:", err.stack);
        });
        downloader.on('progress', function () {
            LOG.info("progress", downloader.progressAmount, downloader.progressTotal);
        });
        downloader.on('end', function () {
            LOG.info("done downloading");
        });
    }
}

import limit from 'limit-framework';
import s3 from 's3';
import homedir from 'homedir';
import fs from 'fs';
import path from 'path';
import {Conf} from './conf';

const LOG = limit.Logger.get('Sync');

let conf = new Conf();

const client = s3.createClient({
    maxAsyncS3: 20,     // this is the default 
    s3RetryCount: 3,    // this is the default 
    s3RetryDelay: 1000, // this is the default 
    multipartUploadThreshold: 20971520, // this is the default (20 MB) 
    multipartUploadSize: 15728640, // this is the default (15 MB) 
    s3Options: {
//Here the data is being pulled from the conf file        
        accessKeyId: conf.id,
        secretAccessKey: conf.key,   
        // any other options are passed to new AWS.S3() 
        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property 
    },
});

export class Sync {

    static backup(backup) {

        LOG.info('backup > ', backup);

        let folders = backup.files;

        for (let folder of folders) {

            let params = {
                localDir: folder.absolutePath,
                deleteRemoved: false, // default false, whether to remove s3 objects 
                // that have no corresponding local file. 

                s3Params: {
                    Bucket: "zailabbackups",
                    Prefix: "20170524/",
                    // other options supported by putObject, except Body and ContentLength. 
                    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property 
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
//When restoring from s3 you have to chose a file (for some reason it won't restore to desktop you have to make a file on the desktop for it to work).
    static restore(folder) {
        LOG.info('restore > ', folder);
        let params = {
            localDir: folder,
            deleteRemoved: false, // default false, whether to remove s3 objects 
            // that have no corresponding local file. 

            s3Params: {
                Bucket: "zailabbackups",
                Prefix: "20170524/",
                // other options supported by putObject, except Body and ContentLength. 
                // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property 
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

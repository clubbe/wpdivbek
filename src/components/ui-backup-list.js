import limit from 'limit-framework';
import template from './ui-backup-list.html';
import jetpack from 'fs-jetpack';
import getSize from 'get-folder-size';
import { FILES } from '../resources/files';
import uuid from 'uuid';

const LOG = limit.Logger.get('BackupList');

export class BackupList extends limit.Component {

    static get tagName() { return 'ui-backup-list'; }
    
    get template() { return template; }
    get resource() { return { files: FILES.values }; }

    created() {

        this.onclick = (event) => {
            if (event.path && event.path[0] && event.path[0].id && event.path[0].id.indexOf && event.path[0].id.indexOf('remove-') === 0) {
                let uuid = event.path[0].id.replace('remove-', '');
                let index = 0;
                for (let file of this.model.files) {
                    if (file.uuid === uuid) {
                        FILES.delete(file.absolutePath);
                        break;
                    }
                    index++;
                }
                this.model.files = FILES.values;
            }
        }

        limit.EVENTS.on('files:added', (filesAdded) => {
            for (let file of filesAdded) {
                file = jetpack.inspect(file.path, { times: true, absolutePath: true });
                if (file.type === 'file' || FILES.has(file.absolutePath)) {
                    return;
                }
                getSize(file.absolutePath, (err, fileSize) => {
                    if (err) { throw err; }
                    file.uuid = uuid.v4();
                    file.size = formatSize(fileSize);
                    file.timestamp = formatTime(file.modifyTime + '');
                    FILES.put(file.absolutePath, file)
                        .then((record) => { this.model.files.push(record); })
                        .catch((error) => { console.log(error); });
                });
            }
        });
    }
}

function formatSize(value) {
    let size;
    let sizes = ['b', 'kb', 'Mb', 'Gb', 'Tb'];
    if (!value) {
        size = value + ` ${sizes[0]}`;
    } else {
        let s = 0;
        let i = sizes.length - 1;
        while (s === 0) {
            size = (value / (Math.pow(1024, i--))).toFixed(2);
            s = Math.floor(size);
            if (s !== 0) {
                size = size + ` ${sizes[i + 1]}`;
            }
        }
    }
    return size;
}

function formatTime(value) {
    let split = value.split(' ');
    return `${split[0]} ${split[1]} ${split[2]} ${split[3]} ${split[4]}`;
}
import limit from 'limit-framework';
import template from './ui-backup.html';
import { FILES } from '../resources/files';
import { Sync } from '../sync';
import { LOADER } from '../loader';

const LOG = limit.Logger.get('Backup');

export class Backup extends limit.Component {

    static get tagName() { return 'ui-backup'; }

    get template() { return template; }

    created() {

        this.find('#backup').then((backup) => {
            backup.onclick = () => {
                LOADER.loading = true;
                Sync.backup({ files: FILES.find(this.selectedBackup.group) }, this.selectedBackup.group);
            };
        });

        limit.EVENTS.on('backup:completed', () => {
            LOADER.loading = false;
        });

        limit.EVENTS.on('files:dropped', (files) => {
            limit.EVENTS.emit('files:added', files);
        });

        limit.EVENTS.on('backup:selected', (backup) => {
            this.selectedBackup = backup;
        });

        LOG.info('home:selected');
        limit.EVENTS.on('home:selected', (backup) => {
            this.selectedBackup = undefined;
        });
    }
}
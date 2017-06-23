import limit from 'limit-framework';
import template from './ui-restore.html';
import { Sync } from '../sync';

const LOG = limit.Logger.get('Restore');

export class Restore extends limit.Component {

    static get tagName() { return 'ui-restore'; }

    get template() { return template; }
    get resource() { return { snapshots: [], bucket: '', loading: true }; }

    created() {

        this.onclick = (event) => {
            if (event.path && event.path[0] && event.path[0].id && event.path[0].id.indexOf && event.path[0].id.indexOf('restore-') === 0) {

                let file = this.query('ui-file').value;
                if (!file) {
                    return;
                }
                LOG.info('file = ', file);

                let index = event.path[0].id.replace('restore-', '');
                LOG.info('index = ', index);

                Sync.restore(file, this.model.bucket, this.model.snapshots[index]);
            }
        }

        let snapshots = () => {
            return this.model.snapshots;
        }

        this.model.index = function () {
            return snapshots().indexOf(this);
        }

        limit.EVENTS.on('backup:completed', (group) => {
            this.model.loading = true;
            LOG.info('runner done for ', group, ' > model = ', this.model);
            if (this.model.bucket && this.model.bucket === group) {
                Sync.list(group)
                    .then((snapshots) => {
                        this.model.snapshots = snapshots;
                        this.model.loading = false;
                    })
                    .catch((err) => {
                        LOG.error(err);
                        this.model.loading = false;
                    });
            }
        });

        limit.EVENTS.on('backup:selected', (backup) => {
            this.model.loading = true;
            Sync.list(backup.group)
                .then((snapshots) => {
                    this.model.snapshots = snapshots;
                    this.model.bucket = backup.group;
                    this.model.loading = false;
                })
                .catch((err) => {
                    LOG.error(err);
                    this.model.loading = false;
                });
        });

        limit.EVENTS.on('home:selected', (backup) => {
            this.model.snapshots = [];
            this.model.bucket = '';
        });
    }
}
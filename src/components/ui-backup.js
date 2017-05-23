import limit from 'limit-framework';
import template from './ui-backup.html';
import { FILES } from '../resources/files';
import { Sync } from '../sync';

const LOG = limit.Logger.get('Backup');

export class Backup extends limit.Component {

    static get tagName() { return 'ui-backup'; }
    get template() { return template; }
    // get resource() { return viewModel(); }

    created() {

        limit.EVENTS.on('files:dropped', (files) => {
            limit.EVENTS.emit('files:added', files);
        });

        this.find('#backup').onclick = () => {
            // LOG.info('viewModel = ', viewModel());
            Sync.backup(viewModel());
        };
    }
}

function viewModel(model) {
    return {
        files: FILES.values
    };
}
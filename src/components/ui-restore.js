import limit from 'limit-framework';
import template from './ui-restore.html';
import { Sync } from '../sync';

const LOG = limit.Logger.get('Restore');

export class Restore extends limit.Component {

    static get tagName() { return 'ui-restore'; }

    get template() { return template; }

    created() {
        this.find('#restore').then((restore) => {
            restore.onclick = () => {
                Sync.restore(this.find('ui-file').value);
            };
        });
    }
}
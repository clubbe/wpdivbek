import limit from 'limit-framework';
import template from './ui-restore.html';
import { Sync } from '../sync';

const LOG = limit.Logger.get('Restore');

export class Restore extends limit.Component {

    static get tagName() { return 'ui-restore'; }
    get template() { return template; }
    get resource() { return { restorePath: '' }; }

    created() {
        this.find('#restore').onclick = () => {
            this.model.restorePath = this.find('ui-file').value;
            Sync.restore(this.model.restorePath);
        };
    }
}
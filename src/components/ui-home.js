import limit from 'limit-framework';
import template from './ui-home.html';
import { BACKUPS } from '../resources/backups';
import uuid from 'uuid';

const LOG = limit.Logger.get('Home');

export class Home extends limit.Component {

  static get tagName() { return 'ui-home'; }

  get template() { return template; }
  get resource() { return { group: '', backups: BACKUPS.values }; }

  created() {

    this.onclick = (event) => {
      if (event.path && event.path[0] && event.path[0].id && event.path[0].id.indexOf && event.path[0].id.indexOf('edit-') === 0) {
        let uuid = event.path[0].id.replace('edit-', '');
        let backup = BACKUPS.find(uuid);
        limit.EVENTS.emit('backup:selected', backup);
      }
    };

    this.find('ui-input').then((input) => {
      input.select();
      input.onaction(() => {
        if (!input.value) {
          return;
        }
        let backup = { uuid: uuid.v4(), group: input.value };
        BACKUPS.put(backup.group, backup)
          .then((record) => { this.model.backups.push(record); })
          .catch((error) => { LOG.error(error); });
      });
    });
  }
}
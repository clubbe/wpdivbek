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


    limit.EVENTS.on('body:clicked', () => {

      if (this.isRecycleOn) {
        this.isRecycleOn = false;
        return;
      }

      for (let backup of this.model.backups) {

        let rec = this.query(`#recycle-${backup.uuid}`);
        let rem = this.query(`#remove-${backup.uuid}`);
        rec.style.display = '';
        rem.style.display = 'none';
      }
    });

    this.onclick = (event) => {

      if (event.path && event.path[0] && event.path[0].id && event.path[0].id.indexOf) {

        if (event.path[0].id.indexOf('edit-') === 0) {

          let uuid = event.path[0].id.replace('edit-', '');
          let backup = BACKUPS.find(uuid);
          limit.EVENTS.emit('backup:selected', backup);
        }

        if (event.path[0].id.indexOf('recycle-') === 0) {

          for (let backup of this.model.backups) {

            let rec = this.query(`#recycle-${backup.uuid}`);
            let rem = this.query(`#remove-${backup.uuid}`);
            rec.style.display = '';
            rem.style.display = 'none';
          }

          let uuid = event.path[0].id.replace('recycle-', '');
          let rec = this.query(`#recycle-${uuid}`);
          let rem = this.query(`#remove-${uuid}`);
          rec.style.display = 'none';
          rem.style.display = '';

          this.isRecycleOn = true;
        }

        if (event.path[0].id.indexOf('remove-') === 0) {

          let uuid = event.path[0].id.replace('remove-', '');
          let backup = BACKUPS.findAndDelete(uuid);
          limit.EVENTS.emit('backup:removed', backup);
          this.model.backups = BACKUPS.values;
        }
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
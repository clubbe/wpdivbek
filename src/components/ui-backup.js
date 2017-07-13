import limit from 'limit-framework';
import template from './ui-backup.html';
import { FILES } from '../resources/files';
import { Sync } from '../sync';
import { Formatter } from '../utils/formatter';

const LOG = limit.Logger.get('Backup');

export class Backup extends limit.Component {

  static get tagName() { return 'ui-backup'; }

  get template() { return template; }
  get resource() { return { total: '' } };

  created() {

    this.find('#backup').then((backup) => {
      backup.onclick = () => {
        Sync.backup(FILES.find(this.selectedBackup.group), this.selectedBackup.group);
      };
    });

    // this.find('.database.icon').then((totalIcon) => {
    //   let clicked, execute;
    //   const reset = () => {
    //     let clicked = false;
    //     let execute = false;
    //   }
    //   const run = () => {
    //     if (execute) {
    //       return;
    //     }
    //     if (clicked) {
    //       clicked = false;
    //       execute = true;
    //     } else {
    //       clicked = true;
    //     }
    //     if (execute) {
    //       Sync.clear(this.selectedBackup.group)
    //         .then(() => { reset(); })
    //         .catch(() => { reset(); });
    //     }
    //   };
    //   reset();
    //   totalIcon.oncontextmenu = () => { run(); };
    //   totalIcon.onclick = () => { run(); };
    // });

    limit.EVENTS.on('files:dropped', (files) => {
      limit.EVENTS.emit('files:added', files);
    });

    limit.EVENTS.on('backup:selected', (backup) => {
      this.selectedBackup = backup;
      this.updateTotal();
    });

    limit.EVENTS.on('home:selected', (backup) => {
      this.selectedBackup = undefined;
    });

    limit.EVENTS.on('file:saved', (record) => {
      this.updateTotal();
    });

    limit.EVENTS.on('file:removed', (record) => {
      this.updateTotal();
    });
  }

  updateTotal() {
    let total = 0;
    if (this.selectedBackup) {
      let files = FILES.find(this.selectedBackup.group);
      for (let file of files) {
        total += file.sizeInBytes;
      }
    }
    this.model.total = Formatter.formatSize(total);
  }
}
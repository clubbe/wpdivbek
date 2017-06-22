import limit from 'limit-framework';
import template from './ui-menu.html';

const LOG = limit.Logger.get('Menu');

export class Menu extends limit.Component {

    static get tagName() { return 'ui-menu'; }

    get template() { return template; }
    get resource() { return { selectedBackup: '', displayHome: 'none', displayTabs: 'none', displayBackup: 'none', displayRestore: 'none', displaySchedule: 'none' }; }

    created() {

        this.parentElement.onclick = () => {
            limit.EVENTS.emit('body:clicked');
        };

        this.elements = {
            home: this.query('#home'),
            backup: this.query('#backup'),
            restore: this.query('#restore'),
            schedule: this.query('#schedule')
        };

        this.elements.home.onclick = () => { this.showHomeView() };
        this.elements.backup.onclick = () => { this.showBackupView() };
        this.elements.restore.onclick = () => { this.showRestoreView() };
        this.elements.schedule.onclick = () => { this.showScheduleView() };

        this.showHomeView();

        limit.EVENTS.on('backup:selected', (backup) => {
            this.model.selectedBackup = backup;
            this.model.displayTabs = '';
            this.showBackupView();

            this.elements.home.className = this.elements.home.className.replace(' active', '');
        });
    }

    showHomeView() {
        this.model.displayHome = '';
        this.model.displayBackup = 'none';
        this.model.displayRestore = 'none';
        this.model.displaySchedule = 'none';
        this.model.selectedBackup = '';
        this.model.displayTabs = 'none';
        limit.EVENTS.emit('home:selected');

        this.elements.home.className += ' active';

        this.elements.backup.className = this.elements.backup.className.replace(' active', '');
        this.elements.restore.className = this.elements.restore.className.replace(' active', '');
        this.elements.schedule.className = this.elements.schedule.className.replace(' active', '');
    }

    showBackupView() {
        this.model.displayHome = 'none';
        this.model.displayBackup = '';
        this.model.displayRestore = 'none';
        this.model.displaySchedule = 'none';

        this.elements.backup.className += ' active';
        this.elements.restore.className = this.elements.restore.className.replace(' active', '');
        this.elements.schedule.className = this.elements.schedule.className.replace(' active', '');
    }

    showRestoreView() {
        this.model.displayHome = 'none';
        this.model.displayBackup = 'none';
        this.model.displayRestore = '';
        this.model.displaySchedule = 'none';

        this.elements.backup.className = this.elements.backup.className.replace(' active', '');
        this.elements.restore.className += ' active';
        this.elements.schedule.className = this.elements.schedule.className.replace(' active', '');
    }

    showScheduleView() {
        this.model.displayHome = 'none';
        this.model.displayBackup = 'none';
        this.model.displayRestore = 'none';
        this.model.displaySchedule = '';

        this.elements.backup.className = this.elements.backup.className.replace(' active', '');
        this.elements.restore.className = this.elements.restore.className.replace(' active', '');
        this.elements.schedule.className += ' active';
    }
}
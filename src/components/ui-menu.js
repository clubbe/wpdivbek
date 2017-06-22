import limit from 'limit-framework';
import template from './ui-menu.html';

const LOG = limit.Logger.get('Menu');

export class Menu extends limit.Component {

    static get tagName() { return 'ui-menu'; }

    get template() { return template; }
    get resource() { return { selectedBackup: '', displayHome: 'none', displayTabs: 'none', displayBackup: 'none', displayRestore: 'none', displaySchedule: 'none' }; }

    created() {

        this.query('#home').onclick = () => { this.showHomeView() };
        this.query('#backup').onclick = () => { this.showBackupView() };
        this.query('#restore').onclick = () => { this.showRestoreView() };
        this.query('#schedule').onclick = () => { this.showScheduleView() };

        this.showHomeView();

        limit.EVENTS.on('backup:selected', (backup) => {
            this.model.selectedBackup = backup;
            this.model.displayTabs = '';
            this.showBackupView();
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
    }

    showBackupView() {
        this.model.displayHome = 'none';
        this.model.displayBackup = '';
        this.model.displayRestore = 'none';
        this.model.displaySchedule = 'none';
    }

    showRestoreView() {
        this.model.displayHome = 'none';
        this.model.displayBackup = 'none';
        this.model.displayRestore = '';
        this.model.displaySchedule = 'none';
    }

    showScheduleView() {
        this.model.displayHome = 'none';
        this.model.displayBackup = 'none';
        this.model.displayRestore = 'none';
        this.model.displaySchedule = '';
    }
}
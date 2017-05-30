import limit from 'limit-framework';
import template from './ui-menu.html';

const LOG = limit.Logger.get('Menu');

export class Menu extends limit.Component {

    static get tagName() { return 'ui-menu'; }

    get template() { return template; }
    get resource() { return { displayBackup: 'none', displayRestore: 'none', displaySchedule: 'none' }; }

    created() {
        this.find('#backup').onclick = () => { this.showBackupView() };
        this.find('#restore').onclick = () => { this.showRestoreView() };
        this.find('#schedule').onclick = () => { this.showScheduleView() };
        this.showBackupView();
    }

    showBackupView() {
        this.model.displayBackup = '';
        this.model.displayRestore = 'none';
        this.model.displaySchedule = 'none';
    }

    showRestoreView() {
        this.model.displayBackup = 'none';
        this.model.displayRestore = '';
        this.model.displaySchedule = 'none';
    }

    showScheduleView() {
        this.model.displayBackup = 'none';
        this.model.displayRestore = 'none';
        this.model.displaySchedule = '';
    }
}
import limit from 'limit-framework';
import template from './ui-menu.html';

export class Menu extends limit.Component {

    static get tagName() { return 'ui-menu'; }
    get template() { return template; }
    get resource() { return viewModel(this.model); }

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

function viewModel(model) {
    return {
        displayBackup: model ? model.displayBackup : 'none',
        displayRestore: model ? model.displayRestore : 'none',
        displaySchedule: model ? model.displaySchedule : 'none'
    };
}
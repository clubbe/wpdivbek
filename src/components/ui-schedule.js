import limit from 'limit-framework';
import template from './ui-schedule.html';

const LOG = limit.Logger.get('Schedule');

export class Schedule extends limit.Component {

    static get tagName() { return 'ui-schedule'; }
    get template() { return template; }
    get resource() { return viewModel(this.model); }

    created() {

        let startTime = this.find('ui-input');
        let snapshotCycleType = this.find('ui-select');
        let snapshotCycleDate = this.find('#snapshotCycleDate');

        snapshotCycleType.onchange = () => {
            this.model.snapshotCycleType = snapshotCycleType.value;
            this.model.displayDate = '';
            if (['Once a week', 'Twice a month'].indexOf(this.model.snapshotCycleType) === -1) {
                this.model.displayDate = 'none';
                this.model.snapshotCycleDate = '';
                snapshotCycleDate.value = '';
            }
        }

        this.find('#schedule').onclick = () => {
            this.model.startTime = startTime.value;
            this.model.snapshotCycleType = snapshotCycleType.value;
            this.model.snapshotCycleDate = snapshotCycleDate.value;
            LOG.info('viewModel = ', viewModel(this.model));
        };
    }

    isBasic() {
        return;
    }
}

function viewModel(model) {
    return {
        startTime: model ? model.startTime : '00:00',
        displayDate: model ? model.displayDate : 'none',
        snapshotCycleType: model ? model.snapshotCycleType : '',
        snapshotCycleDate: model ? model.snapshotCycleDate : '',
        snapshotCycleOptions: ['Every day', 'Once a week', 'Twice a month']
    };
}
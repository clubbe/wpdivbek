import limit from 'limit-framework';
import template from './ui-schedule.html';
import { SCHEDULE } from '../resources/schedule';

const LOG = limit.Logger.get('Schedule');

export class Schedule extends limit.Component {

    static get tagName() { return 'ui-schedule'; }

    get template() { return template; }
    get resource() {
        return {
            startTime: SCHEDULE.startTime || '00:00',
            snapshotCycleType: SCHEDULE.snapshotCycleType,
            snapshotCycleDate: SCHEDULE.snapshotCycleDate.date,
            snapshotCycle: SCHEDULE.snapshotCycleDate.day,
            displayDate: 'none',
            snapshotCycleOptions: ['Every day', 'Once a week', 'Once a month'],
            error: ''
        };
    }

    created() {

        let startTime = this.find('ui-input');
        let snapshotCycleType = this.find('ui-select');
        let snapshotCycleDate = this.find('#snapshotCycleDate');

        snapshotCycleType.onchange = () => {

            this.model.displayDate = '';
            if (['Once a week', 'Once a month'].indexOf(snapshotCycleType.value) === -1) {
                this.model.displayDate = 'none';
                this.model.snapshotCycleDate = '';
                snapshotCycleDate.value = '';
            }
        }

        this.find('#schedule').onclick = () => {

            this.model.error = '';

            let day = false;
            if (snapshotCycleDate && snapshotCycleDate.value) {
                if (snapshotCycleType.value === 'Once a week') {
                    day = snapshotCycleDate.value.dayOfWeek;
                }
                if (snapshotCycleType.value === 'Once a month') {
                    day = snapshotCycleDate.value.dayOfMonth;
                }
            }

            let date = snapshotCycleDate && snapshotCycleDate.value ? snapshotCycleDate.value.date : undefined;
            if (['Once a week', 'Once a month'].indexOf(snapshotCycleType.value) !== -1 && !date) {
                this.model.error = 'Date is required for selected cycle';
            } else {

                this.model.startTime = startTime.value;
                this.model.snapshotCycleType = snapshotCycleType.value;
                this.model.snapshotCycleDate = date;
                this.model.snapshotCycle = day;

                SCHEDULE.startTime = startTime.value;
                SCHEDULE.snapshotCycleType = snapshotCycleType.value;
                SCHEDULE.snapshotCycleDate = {
                    date: date,
                    day: this.model.snapshotCycle
                };
            }
        };

        this.model.displayDate = '';
        if (['Once a week', 'Once a month'].indexOf(this.model.snapshotCycleType) === -1) {
            this.model.displayDate = 'none';
        }
    }
}
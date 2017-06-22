import limit from 'limit-framework';
import template from './ui-schedule.html';
import { SCHEDULE } from '../resources/schedule';

const LOG = limit.Logger.get('Schedule');

export class Schedule extends limit.Component {

    static get tagName() { return 'ui-schedule'; }

    get template() { return template; }
    get resource() {
        return {
            job: SCHEDULE.job || '* * * * * *',
            error: ''
        };
    }

    created() {
        this.find('#schedule').then((schedule) => {
            schedule.onclick = (event) => {

                let job = this.find('ui-input');
                let split = job.value.split(' ');

                this.model.error = '';
                if (!job.value || split.length !== 6 || (split.length === 6 && split[split.length - 1] === '')) {
                    this.model.error = 'Nope';
                    job.select();
                } else {
                    SCHEDULE.job = job.value;
                    this.model.job = job.value;
                }
            }
        });
    }
}
import limit from 'limit-framework';
import template from './ui-schedule.html';
import { SCHEDULE } from '../resources/schedule';
import { Runner } from '../runner';

const LOG = limit.Logger.get('Schedule');

export class Schedule extends limit.Component {

    static get tagName() { return 'ui-schedule'; }

    get template() { return template; }
    get resource() { return { job: '* * * * * *', error: '' }; }

    created() {

        limit.EVENTS.on('backup:selected', (backup) => {
            this.selectedBackup = backup;
            let job = this.query('ui-input');
            SCHEDULE.get(backup.group)
                .then((record) => {
                    job.value = record.job;
                })
                .catch((error) => {
                    let schedule = {
                        job: this.model.job,
                        group: this.selectedBackup.group
                    }
                    SCHEDULE.put(schedule.group, schedule);
                    job.value = schedule.job;
                });
        });

        limit.EVENTS.on('backup:removed', (backup) => {
            SCHEDULE.delete(backup.group);
        });

        limit.EVENTS.on('home:selected', (backup) => {
            this.selectedBackup = undefined;
            this.model.job = '* * * * * *';
        });

        this.query('#schedule').onclick = (event) => {

            let job = this.query('ui-input');
            let split = job.value.split(' ');

            this.model.error = '';
            if (!job.value || split.length !== 6 || (split.length === 6 && split[split.length - 1] === '')) {
                this.model.error = 'Nope';
                job.select();
            } else {
                this.model.job = job.value;
                let schedule = {
                    job: this.model.job,
                    group: this.selectedBackup.group
                }
                SCHEDULE.set(schedule.group, schedule);
                Runner.init();
            }
        };
    }
}
import limit from 'limit-framework';
import schedule from 'node-schedule';
import { SCHEDULE } from './resources/schedule';
import { Sync } from './sync';
import { FILES } from './resources/files';

const LOG = limit.Logger.get('Runner');

export class Runner {

  static init() {
    for (let record of SCHEDULE.values) {
      Runner.schedule(record.group, record.job);
    }
  }

  static schedule(group, job) {
    if (job === '* * * * * *') {
      return;
    }
    if (!this.jobs) {
      this.jobs = {};
    }
    let runner = this.jobs[group];
    if (runner) {
      runner.cancel();
    }
    LOG.info('Schedule ', job, ' for ', group);
    runner = schedule.scheduleJob(job, function () {
      LOG.info('Backup ', FILES.find(group), ' for ', group);
      Sync.backup({ files: FILES.find(group) }, group);
    });
    this.jobs[group] = runner;
  }
}
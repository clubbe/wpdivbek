import limit from 'limit-framework';
import schedule from 'node-schedule';
import { SCHEDULE } from './resources/schedule';
import { Sync } from './sync';
import { FILES } from './resources/files';
import { LOADER } from './loader';

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
    runner = schedule.scheduleJob(job, function () {
      LOADER.loading = 'Uploading';
      Sync.backup({ files: FILES.find(group) }, group);
    });
    this.jobs[group] = runner;
  }
}
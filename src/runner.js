import limit from 'limit-framework';
import schedule from 'node-schedule';
import { SCHEDULE } from './resources/schedule';
import { Sync } from './sync';
import { FILES } from './resources/files';

const LOG = limit.Logger.get('Runner');

export class Runner {

  static init() {
    
    if (this.job) {
      this.job.cancel();
    }
    this.job = schedule.scheduleJob(SCHEDULE.job, function () {

     //Sync.backup({ files: FILES.values });
    });
  }
}
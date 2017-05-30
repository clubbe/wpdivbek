const OBJECT = open();

export class SCHEDULE {

  static get job() {
    return OBJECT.job;
  }

  static set job(job) {
    OBJECT.job = job;
    flush();
  }
}

function open() {
  if (localStorage['SCHEDULE']) {
    return JSON.parse(localStorage['SCHEDULE']);
  } else {
    return {};
  }
}

function flush() {
  localStorage['SCHEDULE'] = JSON.stringify(OBJECT);
}
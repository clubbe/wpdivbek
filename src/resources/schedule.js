const OBJECT = open();

export class SCHEDULE {

  static set startTime(startTime) {
    OBJECT.startTime = startTime;
    flush();
  }

  static set snapshotCycleType(snapshotCycleType) {
    OBJECT.snapshotCycleType = snapshotCycleType;
    flush();
  }

  static set snapshotCycleDate(snapshotCycleDate) {
    OBJECT.snapshotCycleDate = snapshotCycleDate;
    flush();
  }

  static get startTime() {
    return OBJECT.startTime;
  }

  static get snapshotCycleType() {
    return OBJECT.snapshotCycleType;
  }

  static get snapshotCycleDate() {
    return OBJECT.snapshotCycleDate;
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
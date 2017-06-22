const MAP = open();

export class BACKUPS {

    static has(id) {
        return MAP.has(id);
    }

    static put(id, file) {
        return new Promise((resolve, reject) => {
            if (this.has(id)) {
                reject(new Error('must be unique'));
                return;
            }
            this.set(id, file).then((record) => { resolve(record) });
        });
    }

    static get values() {
        return Array.from(MAP.values());
    }

    static get(id) {
        return new Promise((resolve, reject) => {
            if (!this.has(id)) {
                reject();
                return;
            }
            resolve(Object.assign({}, MAP.get(id)));
        });
    }

    static set(id, file) {
        return new Promise((resolve) => {
            let record = Object.assign({}, file);
            MAP.set(id, record);
            flush();
            resolve(record);
        });
    }

    static delete(id) {
        MAP.delete(id);
        flush();
    }

    static find(uuid) {
        for (let value of this.values) {
            if (value.uuid === uuid) {
                return value;
            }
        }
        return null;
    }
}

function open() {
    if (localStorage['BACKUPS']) {
        return new Map(JSON.parse(localStorage['BACKUPS']));
    } else {
        return new Map();
    }
}

function flush() {
    localStorage['BACKUPS'] = JSON.stringify([...MAP]);
}
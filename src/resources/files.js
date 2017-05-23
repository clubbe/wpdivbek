const MAP = new Map();

export class FILES {

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
            resolve(record);
        });
    }

    static delete(id) {
        MAP.delete(id);
    }
}
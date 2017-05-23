import limit from 'limit-framework';

const LOG = limit.Logger.get('Sync');

export class Sync {

    static backup(folders) {
        LOG.info('backup > ', folders);
    }

    static restore(folder) {
        LOG.info('restore > ', folder);
    }
}
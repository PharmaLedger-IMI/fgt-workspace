const {Api, OPERATIONS} = require('../Api');
const {DirectoryEntry} = require("../../fgt-dsu-wizard/model/DirectoryEntry");
const {BadRequest, InternalServerError} = require("../utils/errorHandler");

const DIRECTORY_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ['key']});

module.exports = class DirectoryApi extends Api {
    manager;

    constructor(server, participantManager) {
        super(server, 'directory', participantManager, [OPERATIONS.CREATE, DIRECTORY_GET], DirectoryEntry);
        try {
            this.manager = participantManager.getManager("DirectoryManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }
    }

    /**
     * @param {DirectoryEntry} entry
     * @param {function(err?, DirectoryEntry?)} callback
     */
    create(entry, callback) {
        const self = this;

        self.manager.create(entry, (err, record) => {
            if (err)
                return callback(new BadRequest(err));

            const key = self.manager._genCompostKey(record.role, record.id);
            self.manager.getOne(key, (err, record) => {
                if (err)
                    return callback(new InternalServerError(err));
                callback(undefined, new DirectoryEntry(record));
            });
        });
    }

    /**
     * @param keys
     * @param body
     * @param {function(err?, [{DirectoryEntry}]?)} callback
     */
    createAll(keys, body, callback) {
        return super.createAll([], body, callback);
    }

    /**
     * @param gtin
     * @param batchNumber
     * @param {function(err?, Batch?)} callback
     */
    getOne(id, callback) {
        this.manager.getOne(id, true, (err, record) => {
            if (err)
                return callback(new BadRequest(err));
            callback(undefined, new DirectoryEntry(record));
        })
    }

    /**
     * @param queryParams
     * @param callback
     */
    getAll(queryParams, callback) {
        super.getAll(queryParams, callback);
    }
}
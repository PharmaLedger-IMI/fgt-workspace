
const {Api, OPERATIONS} = require('../Api');
const Batch = require("../../fgt-dsu-wizard/model/Batch");
const {BadRequest, NotImplemented} = require("../utils/errorHandler");

const BATCH_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ['gtin', 'batchNumber']});
const BATCH_UPDATE = Object.assign({}, OPERATIONS.UPDATE, {pathParams: ['gtin', 'batchNumber']});

module.exports = class BatchApi extends Api {
    manager;
    productManager;

    constructor(server, participantManager) {
        super(server, 'batch', participantManager, [OPERATIONS.CREATE, BATCH_GET, BATCH_UPDATE], Batch);
        try {
            this.manager = participantManager.getManager("BatchManager");
            this.productManager = participantManager.getManager("ProductManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }
    }

    /**
     * @param {Batch} batch
     * @param {function(err?, Batch?, KeySSI?)} callback
     */
    create(batch, callback){
        const self = this;

        const {gtin} = batch;
        if (!gtin)
            return callback(`Can't find a product without gtin.`);

        self.productManager.getOne(gtin, (err, product) => {
            if (err)
                return callback(err);

            const [validateErr, _batch] = self._validate(batch, batch.batchStatus);
            if (validateErr)
                return callback(validateErr);

            self.manager.create(product, _batch, (err, keySSI) => {
                if (err)
                    return callback(err);
                self.manager.getOne(product.gtin, _batch.batchNumber, true, (err, _batch) => {
                    if (err)
                        return callback(err);
                    callback(undefined, {..._batch, keySSI: keySSI.derive().getIdentifier()});
                });
            });
        })
    }

    /**
     * @param keys
     * @param body
     * @param {function(err?, [{Batch}]?, KeySSI[]?)} callback
     */
    createAll(keys, body, callback) {
        return super.createAll([], body, callback);
    }

    /**
     * @param gtin
     * @param batchNumber
     * @param {function(err?, Batch?)} callback
     */
    getOne(gtin, batchNumber, callback) {
        this.manager.getOne(gtin, batchNumber, true, (err, batch) => {
            if (err)
                return callback(err);
            callback(undefined, batch);
        })
    }

    /**
     * @param queryParams
     * @param callback
     */
    getAll(queryParams, callback) {
        super.getAll(queryParams, callback);
    }

    /**
     * @param {string} gtin: path param
     * @param {string} batchNumber: path param
     * @param {{status: string, extraInfo: string}} statusUpdate: request.body
     * @param {function(err?, Batch?)} callback
     */
    update(gtin, batchNumber, statusUpdate, callback){
        const self = this;

        self.manager.getOne(gtin, batchNumber, (err, batch) => {
            if (err)
                return callback(new BadRequest(err))

            const oldStatus = batch.batchStatus.status;
            batch.batchStatus.status = statusUpdate.status;
            batch.batchStatus.extraInfo = statusUpdate.extraInfo;
            const [_err, _batch] = self._validate(batch, oldStatus);
            if (_err)
                return callback(new BadRequest(_err));

            self.manager.update(gtin, _batch, (err, updatedBatch) => {
                if (err)
                    return callback(new NotImplemented(err));
                callback(undefined, updatedBatch);
            });
        })
    }

    /**
     * @param {string[]} [keys] can be optional if can be generated from model object
     * @param {[{}]} body a list of model objects
     * @param {function(err?, [{}]?)} callback
     */
    updateAll(keys, body, callback) {
        super.updateAll(['gtin', 'batchNumber'], body, callback);
    }

}
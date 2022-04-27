
const {Api, OPERATIONS} = require('../Api');
const Batch = require("../../fgt-dsu-wizard/model/Batch");
const {BadRequest, InternalServerError} = require("../utils/errorHandler");

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
     * Return an array with auto generated values
     * @param {Number} qty
     * @returns {string[]}
     */
    _genSerialNumbers(qty) {
        // shuffle function, ref. https://bost.ocks.org/mike/shuffle/
        const shuffleArray = function (array) {
            let randomIndex = 0;
            let currentIndex = array.length;
            while (currentIndex !== 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
            }
            return array;
        }

        const toShuffle = [...Array(13).keys()]; // Array that will be shuffle
        const qtyArr = [...Array(qty).keys()]; // common array with size = qty > [1,2,3...qty]
        const shuffled = qtyArr.map((n)=> {
            return shuffleArray(toShuffle).join("");  // after first function call, the shuffle result will be the input to another shuffle
        });
        return shuffled;
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
                return callback(new BadRequest(err));

            if (batch.quantity && batch.serialNumbers)
                return callback(new BadRequest(`To automatically fill serial numbers do not provide serialNumbers field`));

            if (batch.quantity && batch.quantity > 10000 && (!batch.serialNumbers))
                return callback(new BadRequest(`Auto generate serial numbers only supports quantity <= 10000`));

            if (batch.quantity && batch.quantity > 0 && (!batch.serialNumbers))
                batch.serialNumbers = self._genSerialNumbers(batch.quantity);

            const [validateErr, _batch] = self._validate(batch);
            if (validateErr)
                return callback(new BadRequest(validateErr));

            self.manager.create(product, _batch, (err, keySSI) => {
                if (err)
                    return callback(new BadRequest(err));
                self.manager.getOne(product.gtin, _batch.batchNumber, true, (err, _batch) => {
                    if (err)
                        return callback(new InternalServerError(err));
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
                return callback(new BadRequest(err));
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
                    return callback(new InternalServerError(err));
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
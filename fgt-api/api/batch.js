
const {Api, OPERATIONS} = require('../Api');
const Batch = require("../../fgt-dsu-wizard/model/Batch");

class BatchApi extends Api {
    batchManager;

    constructor(server, participantManager) {
        super(server, 'batch', participantManager, [OPERATIONS.CREATE, OPERATIONS.GET, OPERATIONS.UPDATE]);
        try {
            this.batchManager = participantManager.getManager("BatchManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }
    }

    /**
     *
     * @param {string} [gtin]
     * @param {Batch} batch
     * @param {function(err?, Batch?, KeySSI?)} callback
     * @override
     */
    create(gtin, batch, callback){
        const self = this;

        if (!(batch instanceof Batch))
            batch = new Batch(batch);

        const err = batch.validate();
        if (err)
            return callback(err.join(', '));

        self.batchManager.create({gtin: gtin}, batch, (err, keySSI) => {
            if (err)
                return callback(err);
            self.batchManager.getOne(gtin, batch.batchNumber, true, (err, savedBatch) => {
                if (err)
                    return callback(err);
                callback(undefined, savedBatch, keySSI.getIdentifier());
            });
        });
    }

    /**
     * Creates a new Model Object
     * @param {string[]} [keys] can be optional if can be generated from model object
     * @param {[{}]} models a list of model objects
     * @param {function(err?, [{}]?, KeySSI[]?)} callback
     */
    createAll(keys, models, callback){
        const self = this;
        try{
            self.batchManager.beginBatch();
        } catch (e) {
            return self.batchManager.batchSchedule(() => self.createAll.call(self, keys, models, callback));
        }

        super.createAll( keys, models, (err, ...results) => {
            if (err){
                console.log(err);
                return self.batchManager.cancelBatch((_) => callback(err));
            }

            self.batchManager.commitBatch((err) => {
                if (err){
                    console.log(err);
                    return self.batchManager.cancelBatch((_) => callback(err));
                }
                const [created, keySSIs] = results;
                callback(undefined, created, keySSIs);
            });
        });
    }

    update(gtin, newBatch, callback){
        const self = this;

        if (!(newBatch instanceof Batch))
            newBatch = new Batch(newBatch);

        const err = newBatch.validate();
        if (err)
            return callback(err.join(', '));

        self.batchManager.update(gtin, newBatch, (err, updatedBatch) => {
            if (err)
                return callback(err);
            callback(undefined, updatedBatch);
        });
    }


    /**
     * Creates a new Model Object
     * @param {string[]} [keys] can be optional if can be generated from model object
     * @param {[{}]} models a list of model objects
     * @param {function(err?, [{}]?)} callback
     */
    updateAll(keys, models, callback){
        const self = this;
        try{
            self.batchManager.beginBatch();
        } catch (e) {
            return self.batchManager.batchSchedule(() => self.updateAll.call(self, keys, models, callback));
        }

        super.updateAll( keys, models, (err, created) => {
            if (err){
                console.log(err);
                return self.batchManager.cancelBatch((_) => callback(err));
            }

            self.batchManager.commitBatch((err) => {
                if (err){
                    console.log(err);
                    return self.batchManager.cancelBatch((_) => callback(err));
                }
                callback(undefined, created);
            });
        });
    }
}
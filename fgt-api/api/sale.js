
const {Api, OPERATIONS} = require('../Api');
const Sale = require("../../fgt-dsu-wizard/model/Sale");

const SALE_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ['saleId']});

module.exports = class SaleApi extends Api {
    saleManager;

    constructor(server, participantManager) {
        super(server, 'sale', participantManager, [OPERATIONS.CREATE, SALE_GET], Sale);
        try {
            this.saleManager = participantManager.getManager("SaleManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }
    }

    /**
     * @param {Sale} sale
     * @param {function(err?, Sale?, KeySSI?)} callback
     */
    create(sale, callback){
        const self = this;

        const [err, _sale] = self._validate(sale);
        if (err)
            return callback(err);

        self.saleManager.create(_sale, (err, keySSI) => {
            if (err)
                return callback(err);
            callback(undefined, _sale, keySSI.getIdentifier());
        });
    }

    /**
     * @param {string[]} [keys] can be optional if can be generated from model object
     * @param {[{}]} models a list of model objects
     * @param {function(err?, [{}]?, KeySSI[]?)} callback
     */
    createAll(keys, models, callback){
        const self = this;
        try{
            self.saleManager.beginBatch();
        } catch (e) {
            return self.saleManager.batchSchedule(() => self.createAll.call(self, keys, models, callback));
        }

        super.createAll( keys, models, (err, ...results) => {
            if (err){
                console.log(err);
                return self.saleManager.cancelBatch((_) => callback(err));
            }

            self.saleManager.commitBatch((err) => {
                if (err){
                    console.log(err);
                    return self.saleManager.cancelBatch((_) => callback(err));
                }
                const [created, keySSIs] = results;
                callback(undefined, created, keySSIs);
            });
        });
    }

    /**
     * @param saleId
     * @param callback
     */
    getOne(saleId, callback) {
        this.saleManager.getOne(saleId, true, (err, batch) => {
            if (err)
                return callback(err);
            callback(undefined, batch);
        })
    }

    /**
     * @param query
     * @param callback
     */
    getAll(query, callback) {
        this.saleManager.getAll(true, (err, batches) => {
            if (err)
                return callback(err);
            callback(undefined, batches);
        })
    }
}

const {Api, OPERATIONS} = require('../Api');
const Sale = require("../../fgt-dsu-wizard/model/Sale");

const SALE_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ['saleId']});

module.exports = class SaleApi extends Api {
    manager;

    constructor(server, participantManager) {
        super(server, 'sale', participantManager, [OPERATIONS.CREATE, SALE_GET], Sale);
        try {
            this.manager = participantManager.getManager("SaleManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }
    }

    /**
     * @param {Sale} sale
     * @param {function(err?, Sale?)} callback
     */
    create(sale, callback){
        const self = this;

        const [err, _sale] = self._validate(sale);
        if (err)
            return callback(err);

        self.manager.create(_sale, (err, keySSI) => {
            if (err)
                return callback(err);
            callback(undefined, {..._sale, keySSI: keySSI.getIdentifier()});
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
            self.manager.beginBatch();
        } catch (e) {
            return self.manager.batchSchedule(() => self.createAll.call(self, keys, models, callback));
        }

        super.createAll( keys, models, (err, ...results) => {
            if (err){
                console.log(err);
                return self.manager.cancelBatch((_) => callback(err));
            }

            self.manager.commitBatch((err) => {
                if (err){
                    console.log(err);
                    return self.manager.cancelBatch((_) => callback(err));
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
        this.manager.getOne(saleId, true, (err, batch) => {
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
}
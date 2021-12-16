
const {Api, OPERATIONS} = require('../Api');
const Shipment = require("../../fgt-dsu-wizard/model/Shipment");
const SimpleShipment = require('../model/SimpleShipment')
const {BadRequest} = require("../utils/errorHandler");

class ShipmentApi extends Api {
    manager;
    issuedShipmentManager;

    constructor(server, participantManager) {
        super(server, 'shipment', participantManager, [OPERATIONS.CREATE, OPERATIONS.GET, OPERATIONS.UPDATE], SimpleShipment);
        try {
            this.manager = participantManager.getManager("SimpleShipmentManager");
            // this.issuedShipmentManager = participantManager.getManager("IssuedShipmentManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }
    }

    /**
     *
     * @param orderId
     * @param shipment
     * @param {function(err?, {}?)} callback
     * @override
     */
    create(shipment, callback){
        const self = this;

        const [err, _shipment] = this._validate(shipment)
        if (err)
            return callback(new BadRequest(err))

        const { shipmentId } = _shipment
        self.manager.create(shipmentId, _shipment, (err, keySSI) => {
            if (err)
                return callback(err);
            self.manager.getOne(id, batch.batchNumber, true, (err, savedBatch) => {
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
    createAll(keys, body, callback) {
        return super.createAll(['orderId'], body, callback);
    }

    getOne(key, callback) {
        this.manager.getAll(true, (err, records) => {
            callback(err, records);
        })
    }

    getAll(queryParams, callback) {
        super.getAll(queryParams, callback);
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

module.exports = ShipmentApi;
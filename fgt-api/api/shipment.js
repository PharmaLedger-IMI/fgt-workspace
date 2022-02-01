const {Api, OPERATIONS} = require('../Api');
const SimpleShipment = require('../model/SimpleShipment')
const {BadRequest, NotImplemented, InternalServerError} = require("../utils/errorHandler");

const SHIPMENT_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ["shipmentId"]});
const SHIPMENT_UPDATE = Object.assign({}, OPERATIONS.UPDATE, {pathParams: ["shipmentId"]});

class ShipmentApi extends Api {
    manager;

    constructor(server, participantManager) {
        super(server, 'shipment', participantManager, [OPERATIONS.CREATE, SHIPMENT_GET, SHIPMENT_UPDATE], SimpleShipment);
        try {
            this.manager = participantManager.getManager("SimpleShipmentManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }
    }

    /**
     * create a SimpleShipment
     * @param {SimpleShipment} simpleShipment
     * @param {function(err?, {}?)} callback
     * @override
     */
    create(simpleShipment, callback) {
        const self = this;

        const [err, _simpleShipment] = this._validate(simpleShipment);
        if (err)
            return callback(new BadRequest(err));

        self.manager.create(_simpleShipment, (err, keySSI) => {
            if (err)
                return callback(err);
            self.manager.getOne(_simpleShipment.shipmentId, true, (err, record) => {
                if (err)
                    return callback(new InternalServerError(err))
                callback(undefined, {
                    ...record,
                    keySSI: keySSI.getIdentifier()
                });
            })
        });
    }

    /**
     * Creates one or more SimpleShipment from a list in body request.
     * @param {string[]} [keys] not used
     * @param {SimpleShipment} body
     * @param {function(err?, [{SimpleShipment}]?)} callback
     */
    createAll(keys, body, callback) {
        return super.createAll(keys, body, callback);
    }

    /**
     * @param {string} shipmentId
     * @param {function(err, SimpleShipment?)} callback
     */
    getOne(shipmentId, callback) {
        this.manager.getOne(shipmentId, true, (err, records) => {
            callback(err, records);
        });
    }

    /**
     * Performer a query to dsu based on queryParameters (property filters according to the index)
     * @param {{}} queryParams:
     * @param {function(err, [SimpleShipment]?)} callback
     */
    getAll(queryParams, callback) {
        super.getAll(queryParams, callback);
    }

    /**
     * Update ONLY status from provided SimpleShipment
     * @param {string} shipmentId
     * @param {{status: string, extraInfo: string}}statusUpdate
     * @param {function(err, SimpleShipment?)} callback
     */
    update(shipmentId, statusUpdate, callback) {
        this.manager.update(shipmentId, statusUpdate, (err, updatedSimpleShipment) => {
            if (err)
                return callback(err);
            callback(undefined, updatedSimpleShipment);
        })
    }

    /**
     *  Update a list of SimpleShipment
     * @param {string[]} [keys]
     * @param body
     * @param {function(err?, [{}]?)} callback
     */
    updateAll(keys, body, callback) {
        return super.updateAll(['shipmentId'], body, callback);
    }
}

module.exports = ShipmentApi;
const {Api, OPERATIONS} = require('../Api');
const ShipmentLine = require("../../fgt-dsu-wizard/model/ShipmentLine");
const {BadRequest} = require("../utils/errorHandler");

const SHIPMENT_LINE_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ["keySSI"]});

class ShipmentLineApi extends Api {
    manager;

    constructor(server, participantManager) {
        super(server, 'shipmentLine', participantManager, [SHIPMENT_LINE_GET], ShipmentLine);
        try {
            this.manager = participantManager.getManager("ShipmentLineManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }
    }

    /**
     * @param {string} keySSI
     * @param {function(err, ShipmentLine?)} callback
     */
    getOne(keySSI, callback) {
        this.manager.getOne(keySSI, true, (err, record) => {
            if (err)
                return callback(new BadRequest(err));
            callback(undefined, record);
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
}

module.exports = ShipmentLineApi;
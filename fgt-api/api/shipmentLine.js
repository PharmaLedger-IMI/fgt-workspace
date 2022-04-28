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
        this.manager._getDSUInfo(keySSI, (err, record) => {
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
        const {dsuQuery, keyword} = this._queryParamsTransform(queryParams, this.manager.indexes);
        const self = this;
        this.manager.getPage(
            queryParams.itemPerPage || 10,  // items per page
            queryParams.page || 1, // page number
            dsuQuery, // dsuQuery
            keyword, // keyword
            queryParams.sort, // sort
            false,  // readDSU
            (err, page) => {
                if (err)
                    return callback(err);

                const recordIterator = function(records, accum, callback) {
                    if (!callback){
                        callback = accum;
                        accum = []
                    }
                    const record = records.shift();
                    if (!record)
                        return callback(undefined, accum);
                    self.manager._getDSUInfo(record, (err, sl) => {
                        if (err)
                            return callback(err);

                        sl = new ShipmentLine(sl);
                        sl.keySSI = record;
                        accum.push(sl)
                        recordIterator(records, accum, callback);
                    })
                }

                recordIterator(page.items.slice(), (err, lines) => {
                    if (err)
                        return callback(err);
                    page.items = lines;
                    callback(undefined, page)
                })
            }
        );
    }
}

module.exports = ShipmentLineApi;
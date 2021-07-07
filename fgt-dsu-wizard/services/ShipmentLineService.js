const utils = require('../../pdm-dsu-toolkit/services/utils');

const {STATUS_MOUNT_PATH, INFO_PATH} = require('../constants');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function ShipmentLineService
 * @memberOf Services
 */
function ShipmentLineService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const {ShipmentLine} = require('../model');
    const endpoint = 'shipmentline';

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    /**
     * Resolves the DSU and loads the OrderLine object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err, OrderLine)} callback
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                let shipmentLine;
                try{
                    shipmentLine = new ShipmentLine(JSON.parse(data));
                } catch (e){
                    return callback(`Could not parse ShipmentLine in DSU ${keySSI.getIdentifier()}`);
                }

                dsu.readFile(`${STATUS_MOUNT_PATH}${INFO_PATH}`, (err, status) => {
                    if (err)
                        return callback(`could not retrieve shipmentLine status`);
                    try{
                        shipmentLine.status = JSON.parse(status);
                        callback(undefined, shipmentLine);
                    } catch (e) {
                        return callback(`unable to parse ShipmentLine status: ${status.toString()}`);
                    }
                });
            })
        });
    }

    /**
     * Creates an orderLine DSU
     * @param {string} shipmentId
     * @param {ShipmentLine} shipmentLine
     * @param {function} callback
     * @param {KeySSI} statusSSI the keySSI for the OrderStus DSU
     * @return {string} keySSI
     */
    this.create = function(shipmentId, shipmentLine, statusSSI, callback){

        let data = typeof shipmentLine == 'object' ? JSON.stringify(shipmentLine) : shipmentLine;

        let keyGenData = {
            data: shipmentLine.gtin + shipmentLine.senderId + shipmentId + shipmentLine.batch
        }

        if (isSimple){
            let keyGenFunction = require('../commands/setShipmentLineSSI').createShipmentLineSSI;
            let keySSI = keyGenFunction(keyGenData, domain);
            utils.selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);
                dsu.writeFile(INFO_PATH, data, (err) => {
                    if (err)
                        return callback(err);
                    dsu.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(), (err) => {
                        if (err)
                            return callback(err);
                        dsu.getKeySSIAsObject((err, keySSI) => {
                            if (err)
                                return callback(err);
                            callback(undefined, keySSI);
                        });
                    });
                });
            });
        } else {
            let getEndpointData = function (shipmentId, senderId, shipmentLine){
                return {
                    endpoint: endpoint,
                    data: {
                        data: shipmentLine.gtin + shipmentLine.senderId + shipmentId + shipmentLine.batch
                    }
                }
            }

            utils.getDSUService().create(domain, getEndpointData(shipmentId, senderId, shipmentLine), (builder, cb) => {
                builder.addFileDataToDossier(INFO_PATH, data, cb);
            }, callback);
        }
    };
}

module.exports = ShipmentLineService;
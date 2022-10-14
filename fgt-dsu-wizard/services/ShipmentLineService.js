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
    const BRICKS_DOMAIN_KEY = require("opendsu").constants.BRICKS_DOMAIN_KEY
    let keyGenFunction = require('../commands/setShipmentLineSSI').createShipmentLineSSI;


    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    const statusService = new (require('./StatusService'))(domain, strategy);

    const getBricksDomainFromProcess = function(){
        if (!globalThis.process || !globalThis.process["BRICKS_DOMAIN"])
            return undefined;
        return globalThis.process["BRICKS_DOMAIN"];
    }

    this.generateKey = function(shipmentId, shipmentLine, bricksDomain){
        let keyGenData = {
            data: shipmentId + shipmentLine.senderId + shipmentLine.gtin + shipmentLine.batch
        }
        if (bricksDomain)
            keyGenData[BRICKS_DOMAIN_KEY] = bricksDomain
        return keyGenFunction(keyGenData, domain);
    }

    /**
     * Resolves the DSU and loads the OrderLine object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err?, OrderLine?)} callback
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, {skipCache: true}, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                let shipmentLine;
                try{
                    shipmentLine = new ShipmentLine(JSON.parse(data));
                } catch (e){
                    return callback(`Could not parse ShipmentLine in DSU ${keySSI}`);
                }

                utils.getMounts(dsu, '/', STATUS_MOUNT_PATH,  (err, mounts) => {
                    if (err || !mounts[STATUS_MOUNT_PATH])
                        return callback(`Could not find status mount`);
                    console.log(`Loading status for ShipmentLine SSI ${keySSI} with status SSI ${mounts[STATUS_MOUNT_PATH]}`)
                    statusService.get(mounts[STATUS_MOUNT_PATH], (err, status) => {
                        if (err)
                            return callback(err);
                        shipmentLine.status = status;
                        callback(undefined, shipmentLine);
                    });
                });
            });
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

        if (isSimple){
            let keySSI = this.generateKey(shipmentId, shipmentLine, getBricksDomainFromProcess())
            utils.selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);

                const cb = function(err, ...results){
                    if (err)
                        return dsu.cancelBatch(err2 => {
                            callback(err);
                        });
                    callback(undefined, ...results);
                }

                try {
                    dsu.beginBatch();
                } catch (e) {
                    return callback(e);
                }

                dsu.writeFile(INFO_PATH, data, (err) => {
                    if (err)
                        return cb(err);
                    dsu.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(), (err) => {
                        if (err)
                            return cb(err);
                        dsu.commitBatch((err) => {
                            if (err)
                                return cb(err);
                            dsu.getKeySSIAsObject(callback);
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
/**
 * @module fgt-dsu-wizard.services
 */
const utils = require('../../pdm-dsu-toolkit/services/utils');

const {STATUS_MOUNT_PATH, INFO_PATH} = require('../constants');

const GRANULARITY = [10000, 1000, 100, 10, 1]; // amounts to 10000 packs per biggest container

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function ShipmentCodeService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const {Shipment, ShipmentLine} = require('../model');
    const endpoint = 'shipmencode';

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    this.getContainerGranularity = () => GRANULARITY.slice();

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
                try{
                    const orderLine = JSON.parse(data);
                    dsu.readFile(`${STATUS_MOUNT_PATH}${INFO_PATH}`, (err, status) => {
                        if (err)
                            return callback(`could not retrieve shipmentLine status`);
                        try{
                            orderLine.status = JSON.parse(status);
                            callback(undefined, orderLine);
                        } catch (e) {
                            callback(`unable to parse ShipmentLine status: ${data.toString()}`);
                        }
                    });
                } catch (e){
                    callback(`Could not parse ShipmentLine in DSU ${keySSI.getIdentifier()}`);
                }
            })
        });
    }

    /**
     * Creates an orderLine DSU
     * @param {ShipmentCode} shipmentCode
     * @param {function} callback
     * @param {KeySSI} statusSSI the keySSI for the OrderStus DSU
     * @return {string} keySSI
     */
    this.create = function(shipmentCode, statusSSI, callback){

        let data = typeof shipmentCode == 'object' ? JSON.stringify(shipmentCode) : shipmentCode;
        
        if (isSimple){
            let keyGenFunction = require('../commands/setShipmentCodeSSI').createShipmentCodeSSI;
            let keySSI = keyGenFunction('shipmentcode', domain);
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
                        gtin: shipmentLine.gtin,
                        senderId: senderId,
                        shipmentId: shipmentId
                    }
                }
            }

            utils.getDSUService().create(domain, getEndpointData(shipmentId, senderId, shipmentLine), (builder, cb) => {
                builder.addFileDataToDossier(INFO_PATH, data, cb);
            }, callback);
        }
    };


    this.fromShipment = function(shipment, statusSSI, dsu, callback){
        const self = this;
        if (!callback &&  typeof dsu === 'function'){
            callback = dsu;
            dsu = undefined;
        }

        const fallbackCreate = function(){
            self.create(shipment.status, statusSSI, (err, shipmentCodeDSU) => err
                ? callback(err)
                : self.fromShipment(shipment, statusSSI, shipmentCodeDSU, callback));
        }

        const storeStatusInOuterCode = function (dsu, statusSSI, callback){
            dsu.mount(STATUS_MOUNT_PATH, statusSSI, callback);
        }

        const createShipmentCodesRecursively = function(){
            const lines = [];
            const orderLineIterator = function(orderLinesCopy, callback){
                const orderLine = orderLinesCopy.shift();
                if (!orderLine)
                    return callback();

            }
        }

        if (!dsu)
            return fallbackCreate();

        if (!statusSSI)
            return createShipmentCodesRecursively();

        storeStatusInOuterCode(dsu, statusSSI, (err) => err
            ? callback(err)
            : createShipmentCodesRecursively())
    }
}

function splitIntoContainers(shipmentLine){


    const {gtin, batch, quantity} = shipmentLine;



}

module.exports = ShipmentCodeService;
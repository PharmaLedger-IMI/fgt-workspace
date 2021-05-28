/**
 * @module fgt-dsu-wizard.services
 */
const utils = require('../../pdm-dsu-toolkit/services/utils');

const {STATUS_MOUNT_PATH, INFO_PATH} = require('../constants');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function OrderLineService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const OrderLine = require('../model').OrderLine;
    const endpoint = 'orderline';

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
                try{
                    const orderLine = JSON.parse(data);
                    dsu.readFile(`${STATUS_MOUNT_PATH}${INFO_PATH}`, (err, status) => {
                        if (err)
                            return callback(`could not retrieve orderLine status`);
                        try{
                            orderLine.status = JSON.parse(status);
                            callback(undefined, orderLine);
                        } catch (e) {
                            callback(`unable to parse OrderLine status: ${data.toString()}`);
                        }
                    });
                } catch (e){
                    callback(`Could not parse orderLine in DSU ${keySSI.getIdentifier()}`);
                }
            })
        });
    }

    /**
     * Creates an orderLine DSU
     * @param {string} orderId
     * @param {OrderLine} orderLine
     * @param {function} callback
     * @param {KeySSI} statusSSI the keySSI for the OrderStus DSU
     * @return {string} keySSI
     */
    this.create = function(orderId, orderLine, statusSSI, callback){

        let data = typeof orderLine == 'object' ? JSON.stringify(orderLine) : orderLine;

        let keyGenData = {
            data: orderLine.gtin + orderLine.requesterId + orderId
        }

        if (isSimple){
            let keyGenFunction = require('../commands/setOrderLineSSI').createOrderLineSSI;
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
            let getEndpointData = function (orderLine){
                return {
                    endpoint: endpoint,
                    data: {
                        data: orderLine.gtin + orderLine.requesterId + orderId
                    }
                }
            }

            utils.getDSUService().create(domain, getEndpointData(orderLine), (builder, cb) => {
                builder.addFileDataToDossier(INFO_PATH, data, cb);
            }, callback);
        }
    };
}

module.exports = OrderLineService;
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
            gtin: orderLine.gtin,
            requesterId: orderLine.requesterId,
            orderId: orderId
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
                        orderId: orderId,
                        gtin: orderLine.gtin,
                        requesterId: orderLine.requesterId
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
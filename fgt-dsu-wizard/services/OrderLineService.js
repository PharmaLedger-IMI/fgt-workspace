const wizard = require('../../fgt-dsu-wizard');
const strategies = require('./strategy');
const resolver = require('opendsu').loadApi('resolver');

const OrderLine = require('../model').OrderLine;
const domain = 'traceability';
const endpoint = 'orderline';


/**
 * @param {strategies} strategy
 */
function OrderLineService(strategy){
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    /**
     * Creates an order DSU
     * @param {string} orderId
     * @param {OrderLine} orderLine
     * @param {function} callback
     * @return {string} keySSI
     */
    this.create = function(orderId, orderLine, callback){

        let data = typeof orderLine == 'object' ? JSON.stringify(orderLine) : orderLine;

        let keyGenData = {
            gtin: orderLine.gtin,
            requesterId: orderLine.requesterId,
            orderId: orderId
        }

        if (isSimple){
            let keyGenFunction = require('../commands/setOrderLineSSI').createOrderLineSSI;
            let keySSI = keyGenFunction(keyGenData, domain);
            resolver.createDSUForExistingSSI(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);
                dsu.writeFile('/data', data, (err) => {
                    if (err)
                        return callback(err);
                    callback(undefined, keySSI);
                });
            });
        } else {
            const DSUService = wizard.DSUService;

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

            DSUService.create(domain, getEndpointData(orderLine), (builder, cb) => {
                builder.addFileDataToDossier("/data", data, cb);
            }, callback);
        }
    };
}

module.exports = OrderLineService;
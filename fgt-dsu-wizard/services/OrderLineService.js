const utils = require('./utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function OrderLineService(domain, strategy){
    const strategies = require('./strategy');
    const OrderLine = require('../model').OrderLine;
    const endpoint = 'orderline';

    domain = domain || "default";
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
            const resolver = utils.getResolver();
            resolver.createDSUForExistingSSI(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);
                dsu.writeFile('/data', data, (err) => {
                    if (err)
                        return callback(err);
                    dsu.getKeySSIAsObject((err, keySSI) => {
                        if (err)
                            return callback(err);
                        callback(undefined, keySSI);
                    });
                });
            });
        } else {
            const DSUService = utils.getDSUService();

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
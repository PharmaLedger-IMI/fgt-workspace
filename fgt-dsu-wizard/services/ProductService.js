const utils = require('./utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function ProductService(domain, strategy){
    const strategies = require('./strategy');
    const OrderLine = require('../model').Product;
    const endpoint = 'product';

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);
    /**
     * Creates a {@link Product} DSU
     * @param {Product} product
     * @param {function<err, keySSI>} callback
     */
    this.create = function(product, callback){

        let data = typeof product == 'object' ? JSON.stringify(product) : product;

        let keyGenData = {
            gtin: product.gtin
        }

        if (isSimple){
            let keyGenFunction = require('../commands/setProductSSI').createProductSSI;
            let keySSI = keyGenFunction(keyGenData, domain);
            utils.selectMethod(keySSI)(keySSI, (err, dsu) => {
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

            DSUService.create(domain, getEndpointData(product), (builder, cb) => {
                builder.addFileDataToDossier("/data", data, cb);
            }, callback);
        }
    };
}

module.exports = ProductService;
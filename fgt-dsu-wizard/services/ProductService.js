/**
 * @module fgt-dsu-wizard.services
 */
const utils = require('./utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function ProductService(domain, strategy){
    const strategies = require('./strategy');
    const Product = require('../model').Product;
    const endpoint = 'product';

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);
    /**
     * Creates a {@link Product} DSU
     * @param {Product} product
     * @param {function(err, keySSI)} callback
     */
    this.create = function(product, callback){

        let data = typeof product === 'object' ? JSON.stringify(product) : product;

        let keyGenData = {
            gtin: product.gtin
        }

        if (isSimple){
            let keyGenFunction = require('../commands/setProductSSI').createProductSSI;
            let keySSI = keyGenFunction(keyGenData, domain);
            utils.selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);
                dsu.writeFile('/info', data, (err) => {
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
            let getEndpointData = function (product){
                return {
                    endpoint: endpoint,
                    data: {
                        gtin: product.gtin,
                    }
                }
            }

            utils.getDSUService().create(domain, getEndpointData(product), (builder, cb) => {
                builder.addFileDataToDossier("/info", data, cb);
            }, callback);
        }
    };
}

module.exports = ProductService;
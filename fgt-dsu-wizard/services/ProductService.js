/**
 * @module fgt-dsu-wizard.services
 */
const utils = require('../../pdm-dsu-toolkit/services/utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function ProductService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const Product = require('../model').Product;
    const endpoint = 'product';
    const keyGenFunction = require('../commands/setProductSSI').createProductSSI;

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    this.generateKey = function(gtin){
        let keyGenData = {
            gtin: gtin
        }
        return keyGenFunction(keyGenData, domain);
    }

    /**
     * Creates a {@link Product} DSU
     * @param {Product|string} product
     * @param {function(err, keySSI)} callback
     */
    this.create = function(product, callback){

        product = typeof product === 'object' ? product : new Product(JSON.parse(product));
        // if product is invalid, abort immediatly.
        let err = product.validate();
        if (err)
            return callback(err);

        if (isSimple){
            let keySSI = this.generateKey(product.gtin);
            utils.selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);
                dsu.writeFile('/info', JSON.stringify(product), (err) => {
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
                builder.addFileDataToDossier("/info", JSON.stringify(product), cb);
            }, callback);
        }
    };
}

module.exports = ProductService;
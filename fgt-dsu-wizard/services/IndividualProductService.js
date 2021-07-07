const utils = require('../../pdm-dsu-toolkit/services/utils');
const { INFO_PATH } = require('../constants');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function IndividualProductService
 * @memberOf Services
 */
function IndividualProductService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const IndividualProduct = require('../model/IndividualProduct');
    const endpoint = 'individualproduct';
    const keyGenFunction = require('../commands/setIndividualProductSSI').createIndividualProductSSI;

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    this.generateKey = function(gtin, batchNumber, serialNumber){
        let keyGenData = {
            gtin: gtin,
            batchNumber: batchNumber,
            serialNumber: serialNumber
        }
        return keyGenFunction(keyGenData, domain);
    }

    /**
     * Resolves the DSU and loads the Product object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err, Product)} callback
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                let individualProduct;
                try{
                    individualProduct = new IndividualProduct(JSON.parse(data));
                } catch (e) {
                    return callback(`unable to parse Product: ${data}`);
                }
                callback(undefined, individualProduct);
            });
        });
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
                dsu.writeFile(INFO_PATH, JSON.stringify(product), (err) => {
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
                        batchNumber: product.batchNumber,
                        serialNumber: product.serialNumber
                    }
                }
            }

            utils.getDSUService().create(domain, getEndpointData(product), (builder, cb) => {
                builder.addFileDataToDossier(INFO_PATH, JSON.stringify(product), cb);
            }, callback);
        }
    };
}

module.exports = IndividualProductService;
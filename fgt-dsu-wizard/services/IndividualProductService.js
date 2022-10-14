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
    const BRICKS_DOMAIN_KEY = require("opendsu").constants.BRICKS_DOMAIN_KEY


    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    const getBricksDomainFromProcess = function(){
        if (!globalThis.process || !globalThis.process["BRICKS_DOMAIN"])
            return undefined;
        return globalThis.process["BRICKS_DOMAIN"];
    }

    this.generateKey = function(gtin, batchNumber, serialNumber, bricksDomain){
        let keyGenData = {
            gtin: gtin,
            batchNumber: batchNumber,
            serialNumber: serialNumber
        }
        if (bricksDomain)
            keyGenData[BRICKS_DOMAIN_KEY] = bricksDomain
        return keyGenFunction(keyGenData, domain);
    }

    /**
     * Resolves the DSU and loads the IndividualProduct object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err, IndividualProduct)} callback
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
                    return callback(`unable to parse IndividualProduct: ${data.toString()}`);
                }
                callback(undefined, individualProduct);
            });
        });
    }

    /**
     * Creates a {@link Product} DSU
     * @param {IndividualProduct|string} product
     * @param {function(err, keySSI)} callback
     */
    this.create = function(product, callback){

        product = typeof product === 'object' ? product : new Product(JSON.parse(product));
        // if product is invalid, abort immediatly.
        let err = product.validate();
        if (err)
            return callback(err);

        if (isSimple){
            let keySSI = this.generateKey(product.gtin, product.batchNumber, product.serialNumber, getBricksDomainFromProcess());
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

                dsu.writeFile(INFO_PATH, JSON.stringify(product), (err) => {
                    if (err)
                        return cb(err);
                    dsu.commitBatch((err) => {
                        if (err)
                            return cb(err);
                        dsu.getKeySSIAsObject(callback);
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
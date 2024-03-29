const utils = require('../../pdm-dsu-toolkit/services/utils');
const { INFO_PATH } = require('../constants');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function ProductService
 * @memberOf Services
 */
function ProductService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const Product = require('../model/Product');
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

    this.getDeterministic = function(gtin, callback){
        const key = this.generateKey(gtin);
        this.get(key, callback);
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
                let product;

                try{
                    product = new Product(JSON.parse(data));
                } catch (e) {
                    return callback(`unable to parse Product: ${data}`);
                }
                callback(undefined, product);
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
                    }
                }
            }

            utils.getDSUService().create(domain, getEndpointData(product), (builder, cb) => {
                builder.addFileDataToDossier(INFO_PATH, JSON.stringify(product), cb);
            }, callback);
        }
    };

    /**
     * updates a product DSU
     * @param {KeySSI} keySSI
     * @param {Product} product
     * @param {function(err?)} callback
     */
    this.update = function (keySSI, product, callback) {
        return callback(`Product DSUs cannot be updated`);
    }
}

module.exports = ProductService;
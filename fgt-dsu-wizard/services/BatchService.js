const utils = require('../../pdm-dsu-toolkit/services/utils');
const {STATUS_MOUNT_PATH, INFO_PATH} = require('../constants');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function BatchService
 * @module Services
 */
function BatchService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const Batch = require('../model').Batch;
    const endpoint = 'batch';
    const keyGenFunction = require('../commands/setBatchSSI').createBatchSSI;
    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    this.generateKey = function(gtin, batchNumber){
        let keyGenData = {
            gtin: gtin,
            batch: batchNumber
        }
        return keyGenFunction(keyGenData, domain);
    }

    /**
     * Resolves the DSU and loads the Batch object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err, Order)} callback
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                try{
                    const batch = JSON.parse(data);
                    callback(undefined, batch);
                } catch (e) {
                    callback(`unable to parse Batch: ${data.toString()}`);
                }
            });
        });
    }

    /**
     * Creates a {@link Batch} DSU
     * @param {string} gtin
     * @param {Batch} batch
     * @param {function(err, keySSI)} callback
     */
    this.create = function(gtin, batch, callback){

        let data = typeof batch === 'object' ? JSON.stringify(batch) : batch;

        if (isSimple){
            let keySSI = this.generateKey(gtin, batch.batchNumber);
            utils.selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);
                dsu.writeFile(INFO_PATH, data, (err) => {
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
            let getEndpointData = function (batch){
                return {
                    endpoint: endpoint,
                    data: {
                        gtin: gtin,
                        batch: batch.batchNumber
                    }
                }
            }

            utils.getDSUService().create(domain, getEndpointData(batch), (builder, cb) => {
                builder.addFileDataToDossier(INFO_PATH, data, cb);
            }, callback);
        }
    };
}

module.exports = BatchService;
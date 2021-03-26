/**
 * @module fgt-dsu-wizard.services
 */
const utils = require('../../pdm-dsu-toolkit/services/utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
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
                builder.addFileDataToDossier("/info", data, cb);
            }, callback);
        }
    };
}

module.exports = BatchService;
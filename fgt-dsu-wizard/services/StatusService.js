/**
 * @module fgt-dsu-wizard.services
 */
const utils = require('../../pdm-dsu-toolkit/services/utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function StatusService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const OrderStatus = require('../model').OrderStatus;
    const endpoint = 'status';

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    let selectMethod = function(templateKeySSI){
        if (templateKeySSI.getTypeName() === 'array')
            return utils.getResolver().createDSUForExistingSSI;
        return utils.getResolver().createDSU;
    }
    /**
     * Creates an OrderStatus DSU
     * @param {OrderStatus|ShipmentStatus} status
     * @param {function} callback
     * @return {string} keySSI
     */
    this.create = function(status, callback){

        let data = JSON.stringify(status);

        if (isSimple){
            let keyGenFunction = require('../commands/setStatusSSI').createStatusSSI;
            let keySSI = keyGenFunction(status, domain);
            selectMethod(keySSI)(keySSI, (err, dsu) => {
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
            let endpointData = {
                    endpoint: endpoint,
                    data: data
                }

            utils.getDSUService().create(domain, endpointData, (builder, cb) => {
                builder.addFileDataToDossier("/info", data, cb);
            }, callback);
        }
    };
}

module.exports = StatusService;
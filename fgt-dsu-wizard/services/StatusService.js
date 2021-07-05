const utils = require('../../pdm-dsu-toolkit/services/utils');
const {INFO_PATH, LOG_PATH} = require('../constants');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function BatchService
 * @memberOf Services
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

    let createLog = function(id, prevStatus, status){
         return `${id} ${prevStatus ? `updated status from ${prevStatus} to ${status}.` : `set status to ${status}`}`;
    }
    /**
     * Creates an OrderStatus DSU
     * @param {OrderStatus|ShipmentStatus} status
     * @param {String} id the sender id
     * @param {function} callback
     * @return {string} keySSI
     */
    this.create = function(status, id, callback){

        let data = JSON.stringify(status);
        let log = createLog(id, undefined, status);

        if (isSimple){
            let keyGenFunction = require('../commands/setStatusSSI').createStatusSSI;
            let keySSI = keyGenFunction(status, domain);
            selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);
                dsu.writeFile(INFO_PATH, data, (err) => {
                    if (err)
                        return callback(err);

                    const returnFunc = function(err){
                        if (err)
                            return callback(err);
                        dsu.getKeySSIAsObject((err, keySSI) => {
                            if (err)
                                return callback(err);
                            callback(undefined, keySSI);
                        });
                    }

                    dsu.readFile(LOG_PATH, (err, data) => {
                        if (err)
                            return dsu.writeFile(LOG_PATH, JSON.stringify([log]), returnFunc);
                        try {
                            data = JSON.parse(data);
                            if (!Array.isArray(data))
                                return callback(`Invalid log data`);
                            return dsu.writeFile(LOG_PATH, JSON.stringify([...data, log]), returnFunc);
                        } catch (e){
                            return callback(e);
                        }
                    })

                });
            });
        } else {
            return callback(`Not implemented`);
        }
    };

    this.update = function(keySSI, status, id, callback){

        let data = JSON.stringify(status);

        if (isSimple){
            keySSI = utils.getKeySSISpace().parse(keySSI);
            utils.getResolver().loadDSU(keySSI.getIdentifier(), (err, dsu) => {
                if (err)
                    return callback(err);

                dsu.readFile(INFO_PATH, (err, prevStatus) => {
                    if (err)
                        return callback(err);
                    try{
                        prevStatus = JSON.parse(prevStatus);
                        dsu.writeFile(INFO_PATH, data, (err) => {
                            if (err)
                                return callback(err);

                            const returnFunc = function(err){
                                if (err)
                                    return callback(err);
                                dsu.getKeySSIAsObject((err, keySSI) => {
                                    if (err)
                                        return callback(err);
                                    callback(undefined, keySSI);
                                });
                            }

                            let log = createLog(id, prevStatus, status);

                            dsu.readFile(LOG_PATH, (err, data) => {
                                if (err)
                                    return callback(err);
                                try {
                                    data = JSON.parse(data);
                                    if (!Array.isArray(data))
                                        return callback(`Invalid log data`);
                                    return dsu.writeFile(LOG_PATH, JSON.stringify([...data, log]), returnFunc);
                                } catch (e){
                                    return callback(e);
                                }
                            })
                        });
                    } catch (e){
                        return callback(e);
                    }
                });

            });
        } else {
            return callback(`Not implemented`);
        }
    }
}

module.exports = StatusService;
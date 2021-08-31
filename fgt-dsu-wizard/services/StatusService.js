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

    let createLog = function(id, prevStatus, _status){
        let log;
        if (prevStatus) {
            const { status, detail } = prevStatus;
            log = `${id}  updated status from ${prevStatus.status} to ${_status.status}.`;
            return { status: status, detail, log};
        } else {
            const s = (typeof _status === 'undefined') ? _status : _status.status;
            log = `${id} set status to ${s}`;
            return { status: s, log};
        }
    }

    /**
     * Resolves the DSU and loads the status object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err, Shipment, Archive)} callback
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                let status;

                try{
                    status = JSON.parse(data);
                } catch (e){
                    return callback(`Could not parse status in DSU ${keySSI.getIdentifier()}`);
                }

                console.log('@@ StatusService.get status=', status);

                dsu.readFile(LOG_PATH, (err, log) => {
                    if (err)
                        return callback(err);
                    try {
                        log = JSON.parse(log);
                        console.log('@@ StatusService.get log=', log);
                    } catch (e){
                        return callback(e);
                    }
                    if (!Array.isArray(log))
                        return callback(`Invalid log data`);
                    callback(undefined, status, log, dsu);
                });
            });
        });
    }

    /**
     * Creates aC Status DSU
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
                        } catch (e){
                            return callback(e);
                        }
                        if (!Array.isArray(data))
                            return callback(`Invalid log data`);
                        return dsu.writeFile(LOG_PATH, JSON.stringify([...data, log]), returnFunc);
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
            utils.getResolver().loadDSU(keySSI.getIdentifier(), {skipCache: true}, (err, dsu) => {
                if (err)
                    return callback(err);
                dsu.getKeySSIAsObject((err, newKeySSI) => {
                    if (err)
                        return callback(err);
                    dsu.readFile(INFO_PATH, (err, prevStatus) => {
                        if (err)
                            return callback(err);
                        try{
                            prevStatus = JSON.parse(prevStatus);
                        } catch (e){
                            return callback(e);
                        }

                        dsu.writeFile(INFO_PATH, data, (err) => {
                            if (err){
                                console.log(newKeySSI.getTypeName(), newKeySSI.getIdentifier(), data)
                                return callback(err);
                            }


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
                                } catch (e){
                                    return callback(e);
                                }
                                if (!Array.isArray(data))
                                    return callback(`Invalid log data`);
                                return dsu.writeFile(LOG_PATH, JSON.stringify([...data, log]), returnFunc);
                            });
                        });

                    });
                })



            });
        } else {
            return callback(`Not implemented`);
        }
    }
}

module.exports = StatusService;
const utils = require('../../pdm-dsu-toolkit/services/utils');
const {INFO_PATH, LOG_PATH, EXTRA_INFO_PATH} = require('../constants');
const Status = require('../model/Status');

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
        return prevStatus
                ? `${id} updated status from ${prevStatus.status || prevStatus} to ${status.status || status}.`
                : `${id} set status to ${status.status || status}`;
    }

    /**
     * Resolves the DSU and loads the status object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err, Status, Archive)} callback
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

                    const returnFunc = function(extraInfo){
                        const _status = new Status({
                            status: status,
                            log: log,
                            extraInfo: extraInfo
                        });
                        return callback(undefined, _status, dsu);
                    }

                    dsu.readFile(EXTRA_INFO_PATH, (err, extraInfo) => {
                        if (err || !extraInfo)
                            return returnFunc();
                        try{
                            extraInfo = JSON.parse(extraInfo);
                        } catch(e){
                            return callback(e);
                        }
                        returnFunc(extraInfo);
                    });
                });
            });
        });
    }

    const createStatus = function(status, id, oldStatus){
        let log = createLog(id, oldStatus, status);
        return new Status({
            status: status,
            log: [log]
        });
    }

    const parseStatus = function(status, id, oldStatus){
        if (typeof status === 'string')
            return createStatus(status, id, oldStatus);
        if (status instanceof Status)
            return status;
        return new Status(status);
    }

    /**
     * Creates aC Status DSU
     * @param {OrderStatus|ShipmentStatus|Status} status
     * @param {String} id the sender id
     * @param {function} callback
     * @return {string} keySSI
     */
    this.create = function(status, id, callback){
        if (!callback){
            callback = id;
            id = undefined
        } else {
            status = parseStatus(status, id);
        }

        if (isSimple){
            let keyGenFunction = require('../commands/setStatusSSI').createStatusSSI;
            let keySSI = keyGenFunction(status, domain);
            selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);
                dsu.writeFile(INFO_PATH, JSON.stringify(status.status), (err) => {
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

                    dsu.writeFile(LOG_PATH, JSON.stringify(status.log), returnFunc);
                });
            });
        } else {
            return callback(`Not implemented`);
        }
    };

    this.update = function(keySSI, status, id, callback){
        const self = this;

        if (!callback){
            callback = id;
            id = undefined
        } else {
            status = parseStatus(status, id);
        }

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
                            prevStatus = JSON.parse(prevStatus).status;
                        } catch (e){
                            return callback(e);
                        }

                        status = parseStatus(status, id, prevStatus);

                        let stringified;
                        try{
                            stringified = JSON.stringify(status.status);
                        } catch (e){
                            console.log(e)
                        }


                        dsu.writeFile(INFO_PATH, stringified, (err) => {
                            if (err){
                                console.log(newKeySSI.getTypeName(), newKeySSI.getIdentifier(), data);
                                return callback(err);
                            }


                            const returnFunc = function(err){
                                if (err)
                                    return callback(err);
                                dsu.getKeySSIAsObject((err, keySSI) => {
                                    if (err)
                                        return callback(err);
                                    self.get(keySSI, callback);
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
                                dsu.writeFile(LOG_PATH, JSON.stringify([...data, log]), (err) => {
                                    if (err)
                                        return callback(err);
                                    dsu.readFile(EXTRA_INFO_PATH, (err, extraInfo) => {
                                        if (err)
                                            extraInfo = undefined;
                                        else {
                                            try {
                                                extraInfo = JSON.parse(extraInfo);
                                            } catch (e){
                                                return callback(e);
                                            }
                                        }

                                        if (!extraInfo || !status.extraInfo)
                                            return returnFunc();

                                        if (!extraInfo)
                                            extraInfo = {};
                                        extraInfo = Object.assign({}, extraInfo, status.extraInfo);

                                        dsu.writeFile(EXTRA_INFO_PATH, JSON.stringify(extraInfo), returnFunc);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        } else {
            return callback(`Not implemented`);
        }
    }
}

module.exports = StatusService;
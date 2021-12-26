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

    let createLog = function(id, prevStatus, status, timestamp){
        const ts = timestamp ? timestamp : Date.now();
        return prevStatus
                ? `${id} ${ts} updated status from ${prevStatus.status || prevStatus} to ${status.status || status}`
                : `${id} ${ts} set status to ${status.status || status}`;
    }

    const createExtraInfo = function (id, extraInfo, timestamp) {
        return `${id} ${timestamp ? timestamp : Date.now()} ${extraInfo ? extraInfo : ''}`
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

                // console.log('@@ StatusService.get status=', status);

                dsu.readFile(LOG_PATH, (err, log) => {
                    if (err)
                        return callback(err);
                    try {
                        log = JSON.parse(log);
                        // console.log('@@ StatusService.get log=', log);
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

                dsu.writeFile(INFO_PATH, JSON.stringify(status.status), (err) => {
                    if (err)
                        return cb(err);

                    const returnFunc = function(err){
                        if (err)
                            return cb(err);

                        dsu.commitBatch((err) => {
                            if (err)
                                return cb(err);
                            dsu.getKeySSIAsObject(callback);
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

        if (!callback){
            callback = id;
            id = undefined
        } else {
            status = parseStatus(status, id);
        }

        if (isSimple){
            keySSI = utils.getKeySSISpace().parse(keySSI);
            utils.getResolver().loadDSU(keySSI.getIdentifier(), {skipCache: true}, (err, dsu) => {
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

                    status = parseStatus(status, id, prevStatus);

                    let stringified;
                    try{
                        stringified = JSON.stringify(status.status);
                    } catch (e){
                        return callback(e);
                    }

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

                    dsu.writeFile(INFO_PATH, stringified, (err) => {
                        if (err)
                            return cb(err);

                        const returnFunc = function(err){
                            if (err)
                                return cb(err);
                            dsu.commitBatch((err) => {
                                if (err)
                                    return cb(err);
                                dsu.getKeySSIAsObject(callback);
                            });
                        }

                        const timestamp = Date.now()
                        let log = createLog(id, prevStatus, status, timestamp);

                        dsu.readFile(LOG_PATH, (err, data) => {
                            if (err)
                                return cb(err);
                            try {
                                data = JSON.parse(data);
                            } catch (e){
                                return cb(e);
                            }
                            if (!Array.isArray(data))
                                return cb(`Invalid data Types`);
                            dsu.writeFile(LOG_PATH, JSON.stringify([...data, log]), (err) => {
                                if (err)
                                    return cb(err);
                                dsu.readFile(EXTRA_INFO_PATH, (err, extraInfo) => {
                                    if (err)
                                        extraInfo = {};
                                    else {
                                        try {
                                            extraInfo = JSON.parse(extraInfo);
                                        } catch (e){
                                            return cb(err);
                                        }
                                    }

                                    if (!status.extraInfo)
                                        return returnFunc();

                                    if (typeof status.extraInfo === 'object') {
                                        const extraInfoStatusArray = status.extraInfo[status.status];
                                        const lastElement = extraInfoStatusArray === undefined ? '' : extraInfoStatusArray.pop();
                                        if (extraInfo[status.status])
                                            extraInfo[status.status].push(createExtraInfo(id, lastElement, timestamp))
                                        else
                                            extraInfo[status.status] = [createExtraInfo(id, lastElement, timestamp)];
                                    } else if (extraInfo.hasOwnProperty(status.status)) {
                                        extraInfo[status.status].push(createExtraInfo(id, status.extraInfo, timestamp))
                                    } else {
                                        extraInfo[status.status] = [createExtraInfo(id, status.extraInfo, timestamp)]
                                    }
                                    dsu.writeFile(EXTRA_INFO_PATH, JSON.stringify(extraInfo), returnFunc);
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
const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS, ANCHORING_DOMAIN} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const {functionCallIterator} = require('../services').utils;
const TraceabilityService = require('../services/TraceabilityService');
const IndividualProduct = require('../model/IndividualProduct');
const Batch = require('../model/Batch');

const ACTION = {
    REQUEST: 'request',
    RESPONSE: 'response'
}

class RequestCache {
    cache = {};

    submitRequest(id, callback){
        if (id in this.cache)
            return callback(`Id already Exists!`);
        this.cache[id] = callback;
        console.log(`Tracking request ${id} submitted`);
    }

    getRequest(id){
        if (!(id in this.cache))
            throw new Error(`Id does not exist in cache!`);
        const cb = this.cache[id];
        delete this.cache[id];
        return cb;
    }
}

const convertForJson = function(startNode, endNode){
    startNode = Object.assign({}, startNode);
    endNode = Object.assign({}, endNode);

    const nodeIterator = function(node, accumulator = {}){
        node.children = node.children || [];
        node.parents = node.parents || [];

        node.parents.reduce((accum, n) => nodeIterator(n, accum), accumulator);

        node.children = node.children.map(n => n.id);
        node.parents = node.parents.map(n => n.id);
        accumulator[node.id] = accumulator[node.id] || node;
        return accumulator;
    }

    const nodeList = nodeIterator(startNode);

    return {
        startNode: startNode,
        endNode: endNode,
        nodeList: nodeList
    }
}

class TrackMessage {
    id;
    action;
    message;
    requesterId;
    error;

    constructor(trackMessage){
        if (typeof trackMessage !== undefined)
            for (let prop in trackMessage)
                if (trackMessage.hasOwnProperty(prop))
                    this[prop] = trackMessage[prop];
        if (!this.action || !this.message)
            throw new Error(`Needs id, action and message`);
        if (this.action === ACTION.REQUEST && !this.id)
            this.id = Date.now();
        if (this.action === ACTION.REQUEST && !this.requesterId)
            throw new Error("Needs a requester Id for that action");
    }
}

/**
 * Stock Manager Class
 *
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerts is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 *
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class TraceabilityManager
 * @extends Manager
 * @memberOf Managers
 */
class TraceabilityManager extends Manager{
    constructor(participantManager, callback) {
        super(participantManager, DB.traceability, [], (err, manager) => {
            if (err)
                return callback ? callback(err) : console.log(err);
            manager.registerMessageListener((message, cb) => {
                manager.processMessageRecord(message, (err) => {
                    cb(err);
                });
            });
            if (callback)
                callback(undefined, manager);
        });
        this.participantManager = participantManager;
        this.requestCache = new RequestCache();
    }

    _processMessageRecord(message, callback) {
        let self = this;
        if (!message)
            return callback(`No message received. Skipping record.`);

        try {
            message = new TrackMessage(message);
        } catch (e) {
            return callback(e);
        }

        switch (message.action){
            case ACTION.REQUEST:
                return self._trackObj(message.requesterId, message.message, (err, startNode, endNode, nodeList) =>
                    self._replyToMessage(message.id, message.requesterId, startNode, endNode, nodeList, err, self._messageCallback)
                );
            case ACTION.RESPONSE:
                let cb;
                try {
                    cb = self.requestCache.getRequest(message.id);
                } catch (e) {
                    return callback(e);
                }
                cb(message.error, message.message.startNode, message.message.endNode, message.message.nodeList);
                return callback();
            default:
                return callback(`Invalid Action request received: ${message.action}`);
        }
    };

    _trackObj(requesterId, obj, callback){
        if (!callback) { // compatibility
            callback = obj;
            obj = requesterId;
            requesterId = undefined;
        }

        try {
            this.shipmentLineManager = this.shipmentLineManager || this.participantManager.getManager("ShipmentLineManager");
            this.receiptManager = this.receiptManager || this.participantManager.getManager("ReceiptManager");
        } catch (e) {
            return callback(e);
        }
        const tracker = new TraceabilityService(this.shipmentLineManager, this.receiptManager, requesterId);
        const method = !!obj.serialNumber ? tracker.fromProduct : tracker.fromBatch;
        method(obj, (err, startNode, endNode) => {
            if (err)
                return callback(err);
            console.log(`Tracking for product ${obj.gtin}, batch ${obj.batchNumber} and Serial ${obj.serialNumber} complete. Start and end Nodes:`, startNode, endNode);
            const message = convertForJson(startNode, endNode);
            callback(undefined, message.startNode, message.endNode, message.nodeList);
        });
    }



    _replyToMessage(requestId, requesterId, startNode, endNode, nodeList, error, callback){
        const self = this;

        const reply = new TrackMessage({
            id: requestId,
            action: ACTION.RESPONSE,
            message: {
                startNode: startNode,
                endNode: endNode,
                nodeList: nodeList
            },
            error: error
        })
        self.sendMessage(requesterId, reply, callback);
    }

    _getProduct(gtin, callback){
        if (!this.productService)
            this.productService = new (require('../services/ProductService'))(ANCHORING_DOMAIN);
        this.productService.getDeterministic(gtin, callback);
    }

    /**
     * @param {string} key
     * @param {*} obj
     * @param {function(err?, keySSI?, string?)} callback where the string is the mount path relative to the main DSU
     */
    create(key, obj, callback) {
        callback(`Traceability cannot be created`);
    }

    /**
     * @param {string|number} [key] the table key
     * @param {{}} obj
     * @param {function(err?, Stock?)} callback
     * @override
     */
    update(key, obj, callback){
        callback(`Traceability cannot be updated`);
    }

    /**
     * @param {IndividualProduct} obj
     * @param {function(err?, Node?, Node?)} callback
     * @override
     */
    getOne(obj,  callback) {
        let self = this;
        if (!(obj instanceof IndividualProduct))
            return callback(`Invalid Object Provided`);

        if (!obj.manufName)
            return self._getProduct(obj.gtin, (err, p) => {
                if (err)
                    return callback(err);
                obj.manufName = p.manufName;
                self.getOne(obj, callback);
            });

        const identity = self.getIdentity();
        if (identity.id === obj.manufName)
            return self._trackObj(identity.id, obj, callback);

        const message = new TrackMessage({
            id: identity.id + Date.now(),
            action: ACTION.REQUEST,
            message: obj,
            requesterId: identity.id
        });
        self.requestCache.submitRequest(message.id, callback);
        self.sendMessage(obj.manufName, message, self._messageCallback)
    }

    /**
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err?, object[]?)} callback
     * @override
     */
    getAll(readDSU, options, callback){
        callback(`Not the way tracking works`);
    }
}


/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {TraceabilityManager}
 * @memberOf Managers
 */
const getTraceabilityManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(TraceabilityManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new TraceabilityManager(participantManager, callback);
    }

    return manager;
}

module.exports = getTraceabilityManager;
const {functionCallIterator} = require('../fgt-dsu-wizard/services').utils;
const BASE_PATH = '/traceability';
const ALL_SUFFIX = "All";

const OPERATIONS = {
    CREATE: {
        endpoint: 'create',
        method: 'PUT'
    },
    UPDATE: {
        endpoint: 'update',
        method: 'POST'
    },
    GET: {
        endpoint: 'get',
        method: 'GET'
    },
    DELETE: {
        endpoint: 'delete',
        method: 'DELETE'
    },
}

const ensureAllMethods = function(operations){
    return operations.reduce((accum, op) => {
        accum.push(op, {
            endpoint: op.endpoint + ALL_SUFFIX,
            method: op.method
        })
        return accum;
    },[]);
}

/**
 * Reads the request body and parses it to JSON format
 * @param req
 * @param callback
 */
const parseRequestBody = function(req, callback){
    const data = [];

    req.on('data', (chunk) => {
        data.push(chunk);
    });

    req.on('end', () => {
        try {
            req.body = data.length ? JSON.parse(data) : {};
        } catch (e) {
            return callback(e);
        }
        callback(undefined, req.body);
    });
}


class Api {
    endpoint;
    participantManager;

    /**
     *
     * @param {HttpServer} server the server object from API Hub
     * @param {string} endpoint the api endpoint (will be concatenated with {@link BASE_PATH)}
     * @param {[{endpoint: string, method: string, pathParams: string[]?}]} operations relates to {@link OPERATIONS}
     * @param {ParticipantManager} participantManager
     */
    constructor(server, endpoint,participantManager , operations ){
        this.endpoint = endpoint;
        this.participantManager = participantManager;
        this._initialize(server, ensureAllMethods(operations));
    }

    _getEndpoint(){
        return BASE_PATH + (this.endpoint.startsWith('/') ? this.endpoint : "/" + this.endpoint);
    }

    _sendResponse(res, code, response){
        res.statusCode = code;
        if (response)
            res.write(JSON.stringify(response));
        res.send();
    }

    /**
     *
     * @param server
     * @param {[{endpoint: string, method: string, pathParams: string[]?},]} operations relates to {@link OPERATIONS}
     * @private
     */
    _initialize(server, operations){

        const self =this;

        const getMethod = function(method){
            switch(method){
                case OPERATIONS.GET.method:
                    return server.get;
                case OPERATIONS.CREATE.method:
                    return server.put;
                case OPERATIONS.UPDATE.method:
                    return server.post;
                case OPERATIONS.DELETE.method:
                    return server.delete;
                default:
                    throw new Error(`Method not supported: ${method}`);
            }
        }

        const parsePathParams = function(...params){
            if (!params.length)
                return '';
            return "/:" + params.join(':');
        }

        operations.forEach(op => {
            const pathParams = parsePathParams(op.pathParams || []);
            getMethod(op.method)(this._getEndpoint() + parsePathParams(...pathParams), (req, res, next) => {
                parseRequestBody(req, (err, body) => {
                    if (err)
                        return self._sendResponse(res, 500, "Could not parse request Body");
                    const params = Object.values(req.params) || [];
                    if (body)
                        params.push(body);
                    self[op.endpoint].call(self, ...params, (err, ...results) => {
                        if (err)
                            return self._sendResponse(res, 501, `Could not execute select method: ${err}`);
                        self._sendResponse(200, results);
                    });
                });
            });
        });
    }

    /**
     * Creates a new Model Object
     * @param {string} [key] can be optional if can be generated from model object
     * @param {{}} model the model object
     * @param {function(err?, {}?)} callback
     * @returns {*}
     */
    create(key, model, callback){
        return callback(`Not Implemented in master Class`);
    }

    /**
     * Creates a new Model Object
     * @param {string} [keys] can be optional if can be generated from model object
     * @param {[{}]} models a list of model objects
     * @param {function(err?, [{}]?)} callback
     * @returns {*}
     */
    createAll(keys, models, callback){
        functionCallIterator(this.create.bind(this), keys, models, callback);
    }

    update(key, model, callback){
        return callback(`Not Implemented in master Class`);
    }

    /**
     * Creates a new Model Object
     * @param {string} [keys] can be optional if can be generated from model object
     * @param {[{}]} models a list of model objects
     * @param {function(err?, [{}]?)} callback
     * @returns {*}
     */
    updateAll(keys, models, callback){
        functionCallIterator(this.update.bind(this), keys, models, callback);
    }

    getOne(key, callback){
        return callback(`Not Implemented in master Class`);
    }

    getAll(keys, callback){
        functionCallIterator(this.getOne.bind(this), keys, callback);
    }

    delete(key, callback){
        return callback(`Not Implemented in master Class`);
    }

    deleteAll(keys, callback){
        functionCallIterator(this.delete.bind(this), keys, callback);
    }
}

module.exports = {
    Api,
    OPERATIONS
};
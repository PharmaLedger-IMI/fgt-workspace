const {functionCallIterator, log} = require('./utils');
const BASE_PATH = '/traceability';
const ALL_SUFFIX = "All";

const OPERATIONS = {
    CREATE: {
        endpoint: 'create',
        method: 'PUT',
        pathParams: undefined
    },
    UPDATE: {
        endpoint: 'update',
        method: 'POST',
        pathParams: undefined
    },
    GET: {
        endpoint: 'get',
        method: 'GET',
        pathParams: undefined
    },
    DELETE: {
        endpoint: 'delete',
        method: 'DELETE',
        pathParams: undefined
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
    model;
    endpoint;
    participantManager;

    /**
     *
     * @param {HttpServer} server the server object from API Hub
     * @param {string} endpoint the api endpoint (will be concatenated with {@link BASE_PATH)}
     * @param {[{endpoint: string, method: string, pathParams: string[]?}]} operations relates to {@link OPERATIONS}
     * @param {ParticipantManager} participantManager
     * @param model
     */
    constructor(server, endpoint,participantManager , operations, model ){
        this.endpoint = endpoint;
        this.participantManager = participantManager;
        this.model = model;
        this._initialize(server, ensureAllMethods(operations));
    }

    _validate(data, ...params) {
        if(!this.model)
            return ["Unable to validate, it's needed to define a model.", undefined]

        if (!(data instanceof this.model))
            data = new this.model(data);

        const validateErr = data.validate(...params);
        if (validateErr)
            return [validateErr, undefined];
        return [undefined, data];
    }

    /**
     * @param {string} method {@link OPERATIONS}
     * @param {{}} params request path params
     * @param {{}} query request query params
     * @param {{}} body request body
     * @param callback
     * @private
     */
    _methodMiddleware(method, params, query, body, callback) {
        const self = this;
        const methods = {
            create() {self.create.call(self, ...Object.values(params), body, callback)},
            createAll() {self.createAll.call(self, ...body, callback)},

            get() {self.getOne.call(self, ...Object.values(params), callback)},
            getAll() {self.getAll.call(self, query, callback)},

            update() {self.update.call(self, ...Object.values(params), body, callback)},
            updateAll() {self.updateAll.call(self, ...body, callback)},

            delete() {self.delete.call(self, ...Object.values(params), callback)},
            deleteAll() {self.deleteAll.call(self, /*query,*/ body, callback)},
        }
        methods[method]();
    }

    /**
     * Return a normalized URI according to parameters
     * @param  operation  related to {@link OPERATIONS}
     * @param {pathParams: string[]?} params
     * @returns {string}
     */
    _getEndpoint(operation, params){
        const parsePath = (path) => {
            if (!path)
                return "";
            return path.startsWith('/') ? path : ("/" + path);
        }

        const parseParams = (params) => {
            if (!params || !params.length)
                return "";
            return "/:" + params.join("/:");
        }

        return BASE_PATH + parsePath(this.endpoint) + parsePath(operation) + parseParams(params);
    }

    _sendResponse(res, code, response){
        res.statusCode = code;
        if (response)
            res.write(JSON.stringify(response));
        log('_sendResponse=', response);
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
                    return server.get.bind(server);
                case OPERATIONS.CREATE.method:
                    return server.put.bind(server);
                case OPERATIONS.UPDATE.method:
                    return server.post.bind(server);
                case OPERATIONS.DELETE.method:
                    return server.delete.bind(server);
                default:
                    throw new Error(`Method not supported: ${method}`);
            }
        }

        log(`Initializing ${this.endpoint} endpoint with operations:`);

        operations.forEach(op => {
            const method = getMethod(op.method);
            const endpoint = this._getEndpoint(op.endpoint, op.pathParams || []);
            log(`Setting up ${op.method} on ${endpoint}`)
            method(endpoint, (req, res, next) => {
                parseRequestBody(req, (err, body) => {
                    if (err)
                        return self._sendResponse(res, 500, "Could not parse request Body");

                    self._methodMiddleware(op.endpoint, req.params, req.query, body, (err, ...results) => {
                        if (err)
                            return self._sendResponse(res, 501, `Could not execute select method: ${err}`);
                        self._sendResponse(res, 200, results);
                    })
                });
            });
        });

        log(`Initialization for ${this.endpoint} endpoint concluded.`);
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
     * Creates several new Model Object
     * @param {string[]} [keys] can be optional if can be generated from model object
     * @param {[{}]} models a list of model objects
     * @param {function(err?, [{}]?)} callback
     */
    createAll(keys, models, callback){
        functionCallIterator(this.create.bind(this), keys, models, callback);
    }

    /**
     * updates a new Model Object
     * @param {string[]} [key] can be optional if can be generated from model object
     * @param {{}} model a list of model objects
     * @param {function(err?, {}?)} callback
     */
    update(key, model, callback){
        return callback(`Not Implemented in master Class`);
    }

    /**
     * updates several Model Objects
     * @param {string[]} [keys] can be optional if can be generated from model object
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
const {ANCHORING_DOMAIN} = require('../../fgt-dsu-wizard/constants');
const {Api, OPERATIONS} = require('../Api');
const {BadRequest} = require("../utils/errorHandler");

const RESOLVER_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ['gtin', 'batchNumber?']});

class ResolverApi extends Api {
    productService;
    batchService;

    constructor(server, participantManager) {
        super(server, 'resolve', participantManager, [RESOLVER_GET]);
        try {
            this.productManager = new (require('../../fgt-dsu-wizard/services/ProductService'))(ANCHORING_DOMAIN);
            this.batchManager = new (require('../../fgt-dsu-wizard/services/BatchService'))(ANCHORING_DOMAIN);
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }

    }

    // the get deterministic already provides the properly created objects
    _validate(data, ...params) {
        if (!data.validate)
            return ["data is not validatable", undefined];

        let errs = data.validate(...params);
        if (errs) {
            errs = Array.isArray(errs) ? errs.join(' ') : errs;
            return [errs, undefined];
        }
        return [undefined, data];
    }

    /**
     * @param gtin
     * @param batchNumber
     * @param {function(err?, Product?)} callback
     */
    getOne(gtin, batchNumber,  callback) {
        if (!callback){
            callback = batchNumber;
            batchNumber = undefined;
        }

        const cb = function(err, result){
            if (err)
                return callback(new BadRequest(err));
            callback(undefined, result);
        }

        if (!batchNumber)
            return this.productService.getDeterministic(gtin, cb);

        this.batchService.getDeterministic(gtin, batchNumber, cb);
    }
}

module.exports = ResolverApi;
const {Api, OPERATIONS} = require('../Api');
const {BadRequest} = require("../utils/errorHandler");

module.exports = class TraceabilityApi extends Api {
    manager;

    constructor(server, participantManager) {
        super(server, 'traceability', participantManager, [OPERATIONS.CREATE], undefined);
        try {
            this.manager = participantManager.getManager("TraceabilityManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }
    }

    /**
     * Get a traceability from IndividualProduct
     * @param {IndividualProduct} individualProduct
     * @param {function(err, traceability?)} callback
     */
    create(individualProduct, callback) {
        this.manager.getOne(individualProduct, (err, traceability) => {
            if (err)
                return callback(new BadRequest(err))
            callback(undefined, traceability);
        });
    }

    /**
     * Get one or more Traceability from a list in body request.
     * @param {string[]} [keys] not used
     * @param {IndividualProduct} body
     * @param {function(err?, [{traceability}]?)} callback
     */
    createAll(keys, body, callback) {
        return super.createAll([], body, callback);
    }
}
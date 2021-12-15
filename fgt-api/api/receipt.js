
const {Api, OPERATIONS} = require('../Api');
const Receipt = require("../../fgt-dsu-wizard/model/Receipt");

const RECEIPT_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ['receiptId']});

module.exports = class ReceiptApi extends Api {
    manager;

    constructor(server, participantManager) {
        super(server, 'receipt', participantManager, [RECEIPT_GET], Receipt);
        try {
            this.manager = participantManager.getManager("ReceiptManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }
    }

    /**
     * @param {string} receiptId
     * @param {function(err?, Receipt?)} callback
     */
    getOne(receiptId, callback) {
        this.manager.getOne(receiptId, true, (err, receipt) => {
            if (err)
                return callback(err);
            callback(undefined, receipt);
        })
    }

    /**
     * @param queryParams
     * @param callback
     */
    getAll(queryParams, callback) {
        super.getAll(queryParams, callback);
    }
}
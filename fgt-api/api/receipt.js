
const {Api, OPERATIONS} = require('../Api');
const Receipt = require("../../fgt-dsu-wizard/model/Receipt");

const RECEIPT_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ['receiptId']});

module.exports = class ReceiptApi extends Api {
    receiptManager;

    constructor(server, participantManager) {
        super(server, 'receipt', participantManager, [RECEIPT_GET], Receipt);
        try {
            this.receiptManager = participantManager.getManager("ReceiptManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }
    }

    /**
     * @param {string} receiptId
     * @param {function(err?, Receipt?)} callback
     */
    getOne(receiptId, callback) {
        this.receiptManager.getOne(receiptId, true, (err, receipt) => {
            if (err)
                return callback(err);
            callback(undefined, receipt);
        })
    }

    /**
     * @param {{}} query
     * @param {function(err?, [Receipt]?)} callback
     */
    getAll(query, callback) {
        this.receiptManager.getAll(true, (err, receipts) => {
            if (err)
                return callback(err);
            callback(undefined, receipts);
        })
    }
}
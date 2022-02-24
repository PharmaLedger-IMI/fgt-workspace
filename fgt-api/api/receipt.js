
const {Api, OPERATIONS} = require('../Api');
const Receipt = require("../../fgt-dsu-wizard/model/Receipt");
const {BadRequest, InternalServerError} = require("../utils/errorHandler");

const RECEIPT_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ['gtin', 'batchNumber', 'serialNumber']});

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
     * @param gtin
     * @param batchNumber
     * @param serialNumber
     * @param {function(err?, Receipt?)} callback
     */
    getOne(gtin, batchNumber, serialNumber, callback) {
        const receiptId = this.manager._genCompostKey({
            gtin,
            batchNumber,
            serialNumber
        });
        this.manager.getOne(receiptId, true, (err, receipt) => {
            if (err)
                return callback(new BadRequest(err));
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
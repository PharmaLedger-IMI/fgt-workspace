const BatchStatus = require('./BatchStatus')

/**
 * @enum IndividualProductStatus
 * @memberOf Model
 */
const IndividualProductStatus = {
    COMMISSIONED: BatchStatus.COMMISSIONED,
    RECALL: BatchStatus.RECALL,
    DISPENSED: "dispensed",
    ADMINISTERED: "administered",
    DESTROYED: "destroyed"
}

module.exports = IndividualProductStatus;
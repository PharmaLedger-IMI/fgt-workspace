const OrderStatus = require('./OrderStatus');
const BatchStatus = require('./BatchStatus');
const ShipmentStatus = require('./ShipmentStatus');

const validateStatus = function(status){
    const isInStatusObj = function(statusObj){
        return Object.values(statusObj).indexOf(status) !== -1;
    }
   return ![OrderStatus, ShipmentStatus, BatchStatus].every(statusObj => !isInStatusObj(statusObj));
}


/**
 * @prop {string} status on of {@link BatchStatus}/{@link ShipmentStatus}/{@link BatchStatus}
 * @prop {string[]} log
 * @prop {{}} extraInfo object where the keys are a Status, and the values are the info message
 * @class Status
 * @memberOf Model
 */
class Status {
    status;
    log = [];
    extraInfo;

    /**
     * @param {Status | {}} status
     * @constructor
     */
    constructor(status) {
        if (typeof status !== undefined)
            for (let prop in status)
                if (status.hasOwnProperty(prop))
                    this[prop] = status[prop];
    }

    validate() {
        if (this.status)
            return 'Status is mandatory field';

        if (!this.log.length)
            return  'No log information available';

        if(!validateStatus(this.status))
            return 'Status is Invalid';

        if (this.extraInfo)
            if (!Object.keys(this.extraInfo).every(k => !validateStatus(k)))
                return "invalid information entries"

        return undefined;
    }
}

module.exports = Status;

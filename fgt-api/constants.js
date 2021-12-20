const DEFAULT_QUERY_OPTIONS = require('../pdm-dsu-toolkit/constants').DEFAULT_QUERY_OPTIONS;
const {ANCHORING_DOMAIN, STATUS_MOUNT_PATH, INFO_PATH, LINES_PATH, DB} = require('../fgt-dsu-wizard/constants');
/**
 * @namespace Constants
 */

/**
 * DSU mount path
 * @type {string}
 * @memberOf Constants
 */
const SIMPLE_SHIPMENT_MOUNT_PATH = '/shipment';


module.exports = {
    ANCHORING_DOMAIN,
    DEFAULT_QUERY_OPTIONS,
    STATUS_MOUNT_PATH,
    SIMPLE_SHIPMENT_MOUNT_PATH,
    INFO_PATH,
    LINES_PATH,
    DB,
}
/**
 * @namespace Constants
 */

/**
 * Anchoring domain
 * @type {string}
 * @memberOf Constants
 */
const ANCHORING_DOMAIN = "traceability";
/**
 * Batch mount path
 * @type {string}
 * @memberOf Constants
 */
const BATCH_MOUNT_PATH = "/batches";
const INBOX_MOUNT_PATH = '/inbox';
const INBOX_ORDER_LINES_PROP = 'orderLines';
const INBOX_SHIPMENT_LINES_PROP = 'shipmentLines';
const INBOX_RECEIVED_ORDERS_PROP = 'receivedOrders';
const INBOX_RECEIVED_SHIPMENTS_PROP = 'receivedShipments';
const INFO_PATH = require('../pdm-dsu-toolkit/constants').INFO_PATH;
const INPUT_FIELD_PREFIX = require('../pdm-dsu-toolkit/constants').INPUT_FIELD_PREFIX;
const LOG_PATH = '/log';
const EXTRA_INFO_PATH = '/extra';
const ISSUED_ORDERS_MOUNT_PATH = "/issuedOrders";
const INBOX_ORDER_LINES_PATH = '/orderLines';
const PARTICIPANT_MOUNT_PATH = require('../pdm-dsu-toolkit/constants').PARTICIPANT_MOUNT_PATH;
const PRODUCT_MOUNT_PATH = "/products";
const PUBLIC_ID_MOUNT_PATH = "/publicId";
const INBOX_RECEIVED_ORDERS_PATH = '/receivedOrders';
const INBOX_RECEIVED_SHIPMENTS_PATH = '/receivedShipments';
const INBOX_SHIPMENT_LINES_PATH = '/shipmentLines';
const STOCK_PATH = '/stock';
const LINES_PATH = '/lines';
const SHIPMENT_PATH = '/shipment';

const STATUS_MOUNT_PATH = '/status';
const ORDER_MOUNT_PATH = '/order';

/**
 * @deprecated
 * @type {{}}
 * @memberOf Constants
 */
const INBOX_PATHS_AND_PROPS = [
    {path: INBOX_ORDER_LINES_PATH, prop: INBOX_ORDER_LINES_PROP},
    {path: INBOX_SHIPMENT_LINES_PATH, prop: INBOX_SHIPMENT_LINES_PROP},
    {path: INBOX_RECEIVED_ORDERS_PATH, prop: INBOX_RECEIVED_ORDERS_PROP},
    {path: INBOX_RECEIVED_SHIPMENTS_PATH, prop: INBOX_RECEIVED_SHIPMENTS_PROP},
];

/**
 * Database paths
 * @type {{}}
 * @memberOf Constants
 */
const DB = {
    batches: 'batches',
    issuedOrders: 'issuedOrders',
    issuedShipments: 'issuedShipments',
    products: 'products',
    receivedOrders: 'receivedOrders',
    receivedShipments: 'receivedShipments',
    stock: 'stock',
    orderLines: 'orderLines',
    shipmentLines: 'shipmentLines',
    individualProduct: 'individualProduct',
    directory: 'directory',
    sales: 'sales',
    receipts: 'receipts',
    traceability: 'traceability',
    notifications: 'notifications'
}

/**
 * Database Querying options
 * @type {{}}
 * @memberOf Constants
 */
const DEFAULT_QUERY_OPTIONS = require('../pdm-dsu-toolkit/constants').DEFAULT_QUERY_OPTIONS;

const EVENTS = {
    TRACK: {
        REQUEST: 'fgt-track-request',
        RESPONSE: 'fgt-track-response'
    }
}

module.exports = {
    STATUS_MOUNT_PATH,
    DB,
    DEFAULT_QUERY_OPTIONS,
    ANCHORING_DOMAIN,
    BATCH_MOUNT_PATH,
    INBOX_ORDER_LINES_PROP,
    INBOX_MOUNT_PATH,
    INBOX_PATHS_AND_PROPS,
    INBOX_RECEIVED_ORDERS_PROP,
    INBOX_RECEIVED_SHIPMENTS_PROP,
    INBOX_SHIPMENT_LINES_PROP,
    INFO_PATH,
    LOG_PATH,
    EXTRA_INFO_PATH,
    ISSUED_ORDERS_MOUNT_PATH,
    INBOX_ORDER_LINES_PATH,
    PARTICIPANT_MOUNT_PATH,
    PRODUCT_MOUNT_PATH,
    PUBLIC_ID_MOUNT_PATH,
    INBOX_RECEIVED_ORDERS_PATH,
    INBOX_RECEIVED_SHIPMENTS_PATH,
    INBOX_SHIPMENT_LINES_PATH,
    STOCK_PATH,
    LINES_PATH,
    ORDER_MOUNT_PATH,
    INPUT_FIELD_PREFIX,
    EVENTS,
    SHIPMENT_PATH
}
const ANCHORING_DOMAIN = "traceability";
const BATCH_MOUNT_PATH = "/batches";
const INBOX_MOUNT_PATH = '/inbox';
const INBOX_ORDER_LINES_PROP = 'orderLines';
const INBOX_SHIPMENT_LINES_PROP = 'shipmentLines';
const INBOX_RECEIVED_ORDERS_PROP = 'receivedOrders';
const INBOX_RECEIVED_SHIPMENTS_PROP = 'receivedShipments';
const INFO_PATH = require('../pdm-dsu-toolkit/constants').INFO_PATH;
const ISSUED_ORDERS_MOUNT_PATH = "/issuedOrders";
const INBOX_ORDER_LINES_PATH = '/orderLines';
const PARTICIPANT_MOUNT_PATH = require('../pdm-dsu-toolkit/constants').PARTICIPANT_MOUNT_PATH;
const PRODUCT_MOUNT_PATH = "/products";
const PUBLIC_ID_MOUNT_PATH = "/publicId";
const INBOX_RECEIVED_ORDERS_PATH = '/receivedOrders';
const INBOX_RECEIVED_SHIPMENTS_PATH = '/receivedShipments';
const INBOX_SHIPMENT_LINES_PATH = '/shipmentLines';
const STOCK_PATH = '/stock';

// these constants depend on the previous constants
const INBOX_PATHS_AND_PROPS = [
    {path: INBOX_ORDER_LINES_PATH, prop: INBOX_ORDER_LINES_PROP},
    {path: INBOX_SHIPMENT_LINES_PATH, prop: INBOX_SHIPMENT_LINES_PROP},
    {path: INBOX_RECEIVED_ORDERS_PATH, prop: INBOX_RECEIVED_ORDERS_PROP},
    {path: INBOX_RECEIVED_SHIPMENTS_PATH, prop: INBOX_RECEIVED_SHIPMENTS_PROP},
];

const DB = {
    products: 'products',
    batches: 'batches',
    stock: 'stock'
}

const DEFAULT_QUERY_OPTIONS = require('../pdm-dsu-toolkit/constants').DEFAULT_QUERY_OPTIONS;

module.exports = {
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
    ISSUED_ORDERS_MOUNT_PATH,
    INBOX_ORDER_LINES_PATH,
    PARTICIPANT_MOUNT_PATH,
    PRODUCT_MOUNT_PATH,
    PUBLIC_ID_MOUNT_PATH,
    INBOX_RECEIVED_ORDERS_PATH,
    INBOX_RECEIVED_SHIPMENTS_PATH,
    INBOX_SHIPMENT_LINES_PATH,
    STOCK_PATH
}
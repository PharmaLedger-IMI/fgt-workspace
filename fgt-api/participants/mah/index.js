const api = require('./api');
const {initApis, APPS} = require('../../utils');
const getProductManager = require('../../../fgt-dsu-wizard/managers/ProductManager');
const getBatchManager = require('../../../fgt-dsu-wizard/managers/BatchManager');
const getShipmentLineManager = require('../../../fgt-dsu-wizard/managers/ShipmentLineManager');
const getTraceabilityManager = require('../../../fgt-dsu-wizard/managers/TraceabilityManager');
const getReceiptManager = require('../../../fgt-dsu-wizard/managers/ReceiptManager');

const init = function(server){
    initApis(server, api, APPS.MAH, getProductManager, getBatchManager, getShipmentLineManager, getTraceabilityManager, getReceiptManager);
}

module.exports = {
    init
}
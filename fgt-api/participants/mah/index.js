const express = require('express');
require('../../../privatesky/psknode/bundles/openDSU')

const api = require('./api');
const {initApis, APPS} = require('../../utils');
const getProductManager = require('../../../fgt-dsu-wizard/managers/ProductManager');
const getBatchManager = require('../../../fgt-dsu-wizard/managers/BatchManager');
const getShipmentLineManager = require('../../../fgt-dsu-wizard/managers/ShipmentLineManager');
const getTraceabilityManager = require('../../../fgt-dsu-wizard/managers/TraceabilityManager');
const getStockManager = require('../../../fgt-dsu-wizard/managers/StockManager');
const getSaleManager = require('../../../fgt-dsu-wizard/managers/SaleManager');
const getReceiptManager = require('../../../fgt-dsu-wizard/managers/ReceiptManager');


function init(){
    initApis(express, api, APPS.MAH, getProductManager, getBatchManager, getShipmentLineManager, getTraceabilityManager, getStockManager, getSaleManager, getReceiptManager);
}

init();
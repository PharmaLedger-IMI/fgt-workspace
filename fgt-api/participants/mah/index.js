const express = require('express');
require('../../../privatesky/psknode/bundles/openDSU')

const api = require('./api');
const {initApis, APPS} = require('../../utils');
const getProductManager = require('../../../fgt-dsu-wizard/managers/ProductManager');
const getBatchManager = require('../../../fgt-dsu-wizard/managers/BatchManager');
const getTraceabilityManager = require('../../../fgt-dsu-wizard/managers/TraceabilityManager');
const getStockManager = require('../../../fgt-dsu-wizard/managers/StockManager');
const getSaleManager = require('../../../fgt-dsu-wizard/managers/SaleManager');
const getReceiptManager = require('../../../fgt-dsu-wizard/managers/ReceiptManager');
const getShipmentLineManager= require('../../../fgt-dsu-wizard/managers/ShipmentLineManager');
const getDirectoryManager = require('../../../fgt-dsu-wizard/managers/DirectoryManager');
const getSimpleShipmentManager = require('../../managers/SimpleShipmentManager');

const managers = [
    getProductManager,
    getBatchManager,
    getStockManager,
    getSaleManager,
    getReceiptManager,
    getSimpleShipmentManager,
    getShipmentLineManager,
    getTraceabilityManager,
    getDirectoryManager,
];

function init(){
    initApis(express, api, 8081, APPS.MAH, ...managers);
}

init();
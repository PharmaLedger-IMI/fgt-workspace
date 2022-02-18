const express = require('express');
require('../../../privatesky/psknode/bundles/openDSU')

const api = require('./api');
const {initApis, APPS} = require('../../utils');
const getStockManager = require('../../../fgt-dsu-wizard/managers/StockManager');
const getSaleManager = require('../../../fgt-dsu-wizard/managers/SaleManager');
const getReceiptManager = require('../../../fgt-dsu-wizard/managers/ReceiptManager');
const getSimpleShipmentManager = require('../../managers/SimpleShipmentManager');
const getTraceabilityManager = require('../../../fgt-dsu-wizard/managers/TraceabilityManager');

const init = function(){
    initApis(express, api, 3002, APPS.PHARMACY, getStockManager, getSaleManager, getSimpleShipmentManager, getReceiptManager, getTraceabilityManager);
}

init();
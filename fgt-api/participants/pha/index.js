const express = require('express');
require('../../../privatesky/psknode/bundles/openDSU')

const api = require('./api');
const {initApis, APPS} = require('../../utils');
const getProductManager = require("../../../fgt-dsu-wizard/managers/ProductManager");
const getBatchManager = require("../../../fgt-dsu-wizard/managers/BatchManager");
const getStockManager = require('../../../fgt-dsu-wizard/managers/StockManager');
const getSaleManager = require('../../../fgt-dsu-wizard/managers/SaleManager');
const getSimpleShipmentManager = require('../../managers/SimpleShipmentManager');

const init = function(){
    initApis(express, api, 3002, APPS.PHARMACY, getProductManager, getBatchManager, getStockManager, getSaleManager, getSimpleShipmentManager);
}

init();
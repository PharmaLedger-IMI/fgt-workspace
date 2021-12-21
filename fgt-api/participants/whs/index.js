const express = require('express');
require('../../../privatesky/psknode/bundles/openDSU')

const api = require('./api');
const {initApis, APPS} = require('../../utils');
const getProductManager = require("../../../fgt-dsu-wizard/managers/ProductManager");
const getBatchManager = require("../../../fgt-dsu-wizard/managers/BatchManager");
const getStockManager = require('../../../fgt-dsu-wizard/managers/StockManager');
const getSimpleShipmentManager = require('../../managers/SimpleShipmentManager');

const init = function(){
    initApis(express, api, 3001, APPS.WHOLESALER, getProductManager, getBatchManager, getStockManager, getSimpleShipmentManager);
}

init();
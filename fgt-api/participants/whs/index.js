const express = require('express');
require('../../../privatesky/psknode/bundles/openDSU')

const api = require('./api');
const {initApis, APPS} = require('../../utils');
const getStockManager = require('../../../fgt-dsu-wizard/managers/StockManager');
const getSimpleShipmentManager = require('../../managers/SimpleShipmentManager');
const getTraceabilityManager = require('../../../fgt-dsu-wizard/managers/TraceabilityManager');

const init = function(){
    initApis(express, api, 3001, APPS.WHOLESALER, getStockManager, getSimpleShipmentManager, getTraceabilityManager);
}

init();
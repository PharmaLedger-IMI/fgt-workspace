const express = require('express');
require('../../../privatesky/psknode/bundles/openDSU')

const api = require('./api');
const {initApis, APPS} = require('../../utils');
const getProductManager = require('../../../fgt-dsu-wizard/managers/ProductManager');
const getBatchManager = require('../../../fgt-dsu-wizard/managers/BatchManager');
const getShipmentLineManager = require('../../../fgt-dsu-wizard/managers/ShipmentLineManager');
const getTraceabilityManager = require('../../../fgt-dsu-wizard/managers/TraceabilityManager');
const getReceiptManager = require('../../../fgt-dsu-wizard/managers/ReceiptManager');


function init(){
    console.log("here")
    initApis(express, api, APPS.MAH, getProductManager, getBatchManager, getShipmentLineManager, getTraceabilityManager, getReceiptManager);
}

init();
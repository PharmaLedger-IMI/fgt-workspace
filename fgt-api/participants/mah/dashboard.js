const express = require('express');
require('../../../privatesky/psknode/bundles/openDSU')

const getProductManager = require('../../../fgt-dsu-wizard/managers/ProductManager');
const getBatchManager = require('../../../fgt-dsu-wizard/managers/BatchManager');
const getTraceabilityManager = require('../../../fgt-dsu-wizard/managers/TraceabilityManager');
const getStockManager = require('../../../fgt-dsu-wizard/managers/StockManager');
const getSaleManager = require('../../../fgt-dsu-wizard/managers/SaleManager');
const getReceiptManager = require('../../../fgt-dsu-wizard/managers/ReceiptManager');
const getShipmentLineManager= require('../../../fgt-dsu-wizard/managers/ShipmentLineManager');
const getSimpleShipmentManager = require('../../managers/SimpleShipmentManager');
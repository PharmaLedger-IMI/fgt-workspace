const ProductApi = require('../../../api/product');
const BatchApi = require('../../../api/batch');
const StockApi = require('../../../api/stock');
const StockTraceabilityApi = require('../../../api/stockTraceability');
const SaleApi = require('../../../api/sale');
const ReceiptApi = require('../../../api/receipt');
const ShipmentApi = require('../../../api/shipment');
const ShipmentLineApi = require('../../../api/shipmentLine');
const TraceabilityApi = require('../../../api/traceability');
const DirectoryApi = require('../../../api/directory');
const ResolverApi = require("../../../api/resolve");


module.exports = {
    ProductApi,
    BatchApi,
    StockApi,
    StockTraceabilityApi,
    SaleApi,
    ReceiptApi,
    ShipmentApi,
    ShipmentLineApi,
    TraceabilityApi,
    DirectoryApi,
    ResolverApi
}
process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

const test_bundles_path = path.join('../../privatesky/psknode/bundles', 'testsRuntime.js');
const pskruntime_path = path.join('../../privatesky/psknode/bundles', 'pskruntime.js');
require(test_bundles_path);
require(pskruntime_path);

const dc = require("double-check");
const assert = dc.assert;
const tir = require("../../privatesky/psknode/tests/util/tir");

const wizard = require('../../fgt-dsu-wizard');
const dsuService = wizard.DSUService;
const Order = wizard.Model.Order;
const OrderLine = wizard.Model.OrderLine;
const OrderStatus = wizard.Model.OrderStatus;
const OrderService = wizard.Services.OrderService;

let domain = 'traceability';
let testName = 'OrderServiceTest'

let orderService = new OrderService(domain);

assert.callback('Launch API Hub', (testFinishCallback) => {
    dc.createTestFolder(testName, (err, folder) => {
        tir.launchApiHubTestNode(10, folder, err => {
            if (err)
                throw err;
            tir.addDomainsInBDNS(folder,  [domain], (err, bdns) => {
                if (err)
                    throw err;
                console.log('Updated bdns', bdns);

                let orderLine1 = new OrderLine('123', 1, '', '');
                let orderLine2 = new OrderLine('321', 5, '', '');
                let order1 = new Order("IOID1", "TPID1", 'WHSID555', "SA1", OrderStatus.CREATED, [orderLine1, orderLine2]);
                let order2 = new Order("IOID2", "TPID2", 'WHSID432', "SA1", OrderStatus.CREATED, [orderLine1, orderLine2]);

                orderService.create(order1, (err, keySSI)=> {
                    if (err) {
                        console.log("orderService.create failed", err);
                        assert.isNull(err);
                    }
                    testFinishCallback();
                });
            });
        });
    });
}, 3000);



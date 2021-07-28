process.env.NO_LOGS = true;

// require("../../../../../privatesky/psknode/bundles/openDSU");

require("../../privatesky/psknode/bundles/openDSU");

const opendsu = require("opendsu");
const keyssi = opendsu.loadApi('keyssi');
const resolver = opendsu.loadApi('resolver');

const INFO_PATH = '/info';
const SHIPMENT_PATH = '/shipment';
const ORDER_PATH = '/order';

const getShipment = function(id){
    return {
        id: Math.floor(Math.random() * 10000000),
        orderId: id
    }
}

const createMockShipmentDSU = function(orderId, orderSSI, callback){
    const shipmentKey = keyssi.createTemplateSeedSSI('default');
    resolver.createDSU(shipmentKey, (err, shipmentDSU) => {
        if (err)
            return callback(err);
        const mockShipment = getShipment(orderId);
        shipmentDSU.writeFile(INFO_PATH, JSON.stringify(mockShipment), (err) => {
            if (err)
                return callback(err);
            shipmentDSU.mount(ORDER_PATH, orderSSI, (err) => {
                if (err)
                    return callback(`could not mount order DSU`);
                shipmentDSU.getKeySSIAsObject((err, keySSI) => {
                    if (err)
                        return callback(err);
                    console.log(`Shipment SSI created with SSI ${keySSI.getIdentifier()}`)
                    callback(undefined, keySSI)
                });
            });
        });
    });
}

const test = function(orderSSI, callback){
    resolver.loadDSU(orderSSI, (err, dsu) => {
        dsu.readFile(INFO_PATH, (err, orderData) => {
            if (err)
                return callback(err);
            let order
            try {
                order = JSON.parse(orderData);
            } catch (e) {
                return callback(e);
            }

            dsu.readFile(`${SHIPMENT_PATH}${INFO_PATH}`, (err, data) => {
                if (err)
                    return callback(err);
                let shipment;
                try {
                    shipment = JSON.parse(data);
                } catch (e) {
                    return callback(e);
                }

                if (order.orderId !== shipment.orderId)
                    return callback(`orders do not match`);
                callback();
            });
        });
    });
}

process.on('message', (args) => {
    const {id, terminate, orderSSI, runTest} = args;

    if (terminate){
        console.log(`SENDER: Received termination notice. Shutting down listener due to: ${terminate}`);
        process.exit(0);
    }

    if (runTest){
        return test(orderSSI, (err) => {
            process.send({
                err: err,
                testResult: true
            });
        })
    }

    createMockShipmentDSU(id, orderSSI,(err, shipmentSSI) => {
        if (err)
            return callback(err);
        process.send({
            shipmentSSI: shipmentSSI.derive().getIdentifier()
        });
    });
})
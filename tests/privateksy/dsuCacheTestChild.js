process.env.NO_LOGS = true;

// require("../../../../../privatesky/psknode/bundles/openDSU");

require("../../privatesky/psknode/bundles/openDSU");

const opendsu = require("opendsu");
const keyssi = opendsu.loadApi('keyssi');
const resolver = opendsu.loadApi('resolver');

const INFO_PATH = '/info';
const STATUS_PATH = '/status';

const getShipment = function(id){
    return {
        id: Math.floor(Math.random() * 10000000),
        orderId: id
    }
}

const createMockStatusDSU = function(status, callback){
    const statuSSI = keyssi.createTemplateSeedSSI('default');
    resolver.createDSU(statuSSI, (err, shipmentDSU) => {
        if (err)
            return callback(err);
        shipmentDSU.writeFile(INFO_PATH, JSON.stringify(status), (err) => {
            if (err)
                return callback(err);
            shipmentDSU.getKeySSIAsObject((err, keySSI) => {
                if (err)
                    return callback(err);
                console.log(`Status SSI created with SSI ${keySSI.getIdentifier()}`)
                callback(undefined, keySSI)
            })
        });
    });
}

const createMockShipmentDSU = function(orderId, callback){
    const shipmentKey = keyssi.createTemplateSeedSSI('default');
    resolver.createDSU(shipmentKey, (err, shipmentDSU) => {
        if (err)
            return callback(err);
        const mockShipment = getShipment(orderId);
        shipmentDSU.writeFile(INFO_PATH, JSON.stringify(mockShipment), (err) => {
            if (err)
                return callback(err);
            createMockStatusDSU("status0", (err, statusSSI) => {
                if (err)
                    return callback(err);
                shipmentDSU.mount(STATUS_PATH, statusSSI.getIdentifier(), (err) => {
                    if (err)
                        return callback(err);
                    console.log(`Status DSU mounted at ${STATUS_PATH} with SSI ${statusSSI.getIdentifier()}`)
                    shipmentDSU.getKeySSIAsObject((err, keySSI) => {
                        if (err)
                            return callback(err);
                        console.log(`Shipment SSI created with SSI ${keySSI.getIdentifier()}`)
                        callback(undefined, keySSI)
                    });
                });
            });
        });
    });
}

const updateShipmentStatus = function(shipmentSSI, newStatus, callback){
    resolver.loadDSU(shipmentSSI, (err, shipmentDsu) => {
        if (err)
            return callback(err);
        shipmentDsu.listMountedDSUs('/', (err, mounts) => {
            if (err)
                return callback(err);


            mounts = mounts.reduce((accum, m) => {
                accum[m.path] = m.identifier;
                return accum;
            }, {});
            console.log("mounts: ", mounts)

            if (!mounts[STATUS_PATH.substring(1)])
                return callback(`No status mounts found`);

            let keySSI;
            try {
                console.log(`Identifier to be parsed: ${mounts[STATUS_PATH.substring(1)]}`)
                keySSI = keyssi.parse(mounts[STATUS_PATH.substring(1)].identifier);
            } catch (e) {
                return callback(e.message);
            }

            console.log(`loading DSU with SSI ${keySSI.getIdentifier()}`);
            resolver.loadDSU(keySSI, (err, statusDSU) => {
                if (err)
                    return callback(err);
                console.log(`Updating status to ${newStatus}`);
                statusDSU.writeFile(INFO_PATH, JSON.stringify(newStatus), err => {
                    if (err)
                        return callback(err)
                    console.log(`status updated to ${newStatus}`);
                    callback()
                });
            });
        });
    });
}

process.on('message', (args) => {
    const {id, terminate, updates, updateTimeout} = args;

    if (terminate){
        console.log(`SENDER: Received termination notice. Shutting down listener due to: ${terminate}`);
        process.exit(0);
    }

    createMockShipmentDSU(id, (err, shipmentSSI) => {
        if (err)
            return callback(err);
        const shipmentReadSSI = shipmentSSI.derive();
        process.send({
            shipmentSSI: shipmentReadSSI.getIdentifier(),
            status: 'status0'
        });

        console.log(`Shipment Created and sent. updating in ${updateTimeout / 1000} seconds`);
        let updateCount = 1
        const updater = function(){
            setTimeout(() => {
                if (updateCount > updates)
                    return console.log(`All status updates sent`)
                const newStatus = 'status' + updateCount;
                updateShipmentStatus(shipmentSSI, newStatus, (err) => {
                    if (err)
                        return process.send({err: err});
                    process.send({
                        shipmentSSI: shipmentReadSSI.getIdentifier(),
                        status: newStatus
                    });
                    updateCount++;
                    updater();
                })
            }, updateTimeout)
        }
        updater();
    });
})
const genId = () => `${new Date() * Math.random()}`.substring(0, 10);

const mahParticipant = 'MAH324353426';
const whsParticipant = 'PHA324353426';
const phaParticipant = 'PHA324353426';

const products = [
    {
        gtin: genId(),
        name: `Product 1`,
        description: `product 1 description`
    },
    {
        gtin: genId(),
        name: `Product 2`,
        description: `product 2 description`
    }
]

const batches = [
    {
        gtin: products[0].gtin,
        batchNumber: genId(),
        expiry: "2023-01-01",
        serialNumbers: [20220101, 20220102, 20220103]
    },
    {
        gtin: products[1].gtin,
        batchNumber: genId(),
        expiry: "2023-01-01",
        serialNumbers: [20220101, 20220102, 20220103]
    }
]

const shipments = [
    {
        orderId: `${genId()}`,
        requesterId: phaParticipant,
        senderId: mahParticipant,
        status: "created",
        shipmentLines: [
            {
                gtin: batches[0].gtin,
                batch: batches[0].batchNumber,
                requesterId: phaParticipant,
                senderId: mahParticipant,
                quantity: 1,
                status: "created"
            }
        ]
    },
    {
        orderId: `${genId()}`,
        requesterId: phaParticipant,
        senderId: mahParticipant,
        status: "created",
        shipmentLines: [
            {
                gtin: batches[1].gtin,
                batch: batches[1].batchNumber,
                requesterId: phaParticipant,
                senderId: mahParticipant,
                quantity: 1,
                status: "created"
            }
        ]
    }
]

const sales = [
    {
        id: `${genId()}`,
        sellerId: phaParticipant,
        productList: [
            {
                gtin: batches[0].gtin,
                batchNumber: batches[0].batchNumber,
                serialNumber: batches[0].serialNumbers[0],
                manufName: mahParticipant
            }
        ]
    },
    {
        id: `${genId()}`,
        sellerId: phaParticipant,
        productList: [
            {
                gtin: batches[0].gtin,
                batchNumber: batches[0].batchNumber,
                serialNumber: batches[0].serialNumbers[0],
                manufName: mahParticipant
            }
        ]
    }
]

let initialize = undefined;
class DB {
    constructor() {
        if(!initialize){
            this.products = products;
            this.batches = batches;
            this.shipments = shipments;
            this.sales = sales;

            this.mahParticipant = mahParticipant;
            this.whsParticipant = whsParticipant;
            this.phaParticipant = phaParticipant;
            initialize = this;
        }
        return initialize;
    }
}

const db = new DB();
module.exports = db;

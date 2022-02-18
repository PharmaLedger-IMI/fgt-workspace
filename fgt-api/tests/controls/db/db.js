const genId = (n) => {
    const id = `${Math.random()}`.replace('.', '') + Date.now() + `${Math.random()}`.replace('.', '');
    return id.slice(0, n || 14);
}

// https://www.gs1.org/services/how-calculate-check-digit-manually
const calculateGtinCheckSum = (digits) => {
    digits = '' + digits;
    if (digits.length !== 13)
        throw new Error(`needs to received 13 digits`);
    const multiplier = [3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3];
    let sum = 0;
    try {
        // multiply each digit for its multiplier according to the table
        for (let i = 0; i < 13; i++)
            sum += parseInt(digits.charAt(i)) * multiplier[i];

        // Find the nearest equal or higher multiple of ten
        const remainder = sum % 10;
        let nearest;
        if (remainder === 0)
            nearest = sum;
        else
            nearest = sum - remainder + 10;

        return nearest - sum;
    } catch (e) {
        throw new Error(`Did this received numbers? ${e}`);
    }
}

const genGtin = () => {
    const digits = `${genId(13)}`;
    return digits + calculateGtinCheckSum(digits);
}

const mahParticipant = 'MAH324353426';
const whsParticipant = 'WHS324353426';
const phaParticipant = 'PHA324353426';

const products = [
    {
        gtin: genGtin(),
        name: `Product 1`,
        description: `product 1 description`
    },
    {
        gtin: genGtin(),
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
        gtin: products[0].gtin,
        batchNumber: genId(),
        expiry: "2023-01-01",
        serialNumbers: [20220101, 20220102, 20220103]
    }
]

const shipments = [
    {
        shipmentId: `${phaParticipant}${genId()}`,
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
            },
            {
                gtin: batches[1].gtin,
                batch: batches[1].batchNumber,
                requesterId: phaParticipant,
                senderId: mahParticipant,
                quantity: 1,
                status: "created"
            }
        ]
    },
    {
        shipmentId: `${phaParticipant}${genId()}`,
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
    },
    {
        id: `${genId()}`,
        sellerId: phaParticipant,
        productList: [
            {
                gtin: batches[1].gtin,
                batchNumber: batches[1].batchNumber,
                serialNumber: batches[1].serialNumbers[0],
                manufName: mahParticipant
            }
        ]
    },
    {
        id: `${genId()}`,
        sellerId: phaParticipant,
        productList: [
            {
                gtin: batches[1].gtin,
                batchNumber: batches[1].batchNumber,
                serialNumber: batches[1].serialNumbers[0],
                manufName: mahParticipant
            }
        ]
    },
]

let initialize = undefined;

class DB {
    constructor() {
        if (!initialize) {
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

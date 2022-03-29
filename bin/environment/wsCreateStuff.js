/**
 * Experimental tool to create some products and batches using api services.
 * Uses some files common to the setup.js utility,
 * #66
 * 
 * Onde node <= v14 we recommend that you run this script with option
 * --unhandled-rejections=strict
 * 
 * Example: 
 * fgt-workspace/bin/environment$ node --unhandled-rejections=strict wsCreateStuff.js 
 */

const http = require('http');
const https = require('https');

const { argParser, validateGtin, generateRandomInt } = require('./utils');

const ShipmentStatus = require('../../fgt-dsu-wizard/model/ShipmentStatus');
const BatchStatus = require('../../fgt-dsu-wizard/model/BatchStatus');

const credentials = require('./credentials/credentialsTests'); // TODO require ../../docker/api/env/mah-*.json ?
const MAHS = [credentials.PFIZER, credentials.MSD, credentials.ROCHE, credentials.BAYER, credentials.NOVO_NORDISK, credentials.GSK, credentials.TAKEDA];
const MAH_MSD = credentials.MSD;
const WSH1 = require("../../docker/api/env/whs-1.json");
const WSH2 = require("../../docker/api/env/whs-2.json");
const PHA1 = require("../../docker/api/env/pha-1.json");
const PHA2 = require("../../docker/api/env/pha-2.json");
const SHIPMENTS_ON_PHA = [];

const NUM_SALES = 2; // number of sales to perform - for now consume serialNumbers from 1st MSD batch
const MY_SALES = []; // array of data returned by /sale/create

let SLEEP_MS = 2000;

//const products = require('./products/productsTests');
const getBatches = require('./batches/batchesRandom');


class ProductsEnum {
    static none = "none";
    static test = "test";
};

class BatchesEnum {
    static none = "none";
    static test = "test";
    static random = "random";
};

class ShipmentsEnum {
    static none = "none";
    static test = "test";
    static random = "random";
};

class SalesEnum {
    static none = "none";
    static test = "test";
};

class TraceabilityEnum {
    static none = "none";
    static test = "test";
};

class ReceiptsEnum {
    static none = "none";
    static test = "test";
};

const defaultOps = {
    ignoreDups: "t", // falsy will 
    wsProtocol: "http",
    wsDomainSuffix: ".localhost",
    wsPortNumber: "8080",
    env: "localhost",
    products: ProductsEnum.test,
    batches: BatchesEnum.test,
    shipments: ShipmentsEnum.test,
    sales: SalesEnum.test,
    traceability: TraceabilityEnum.test,
    receipts: ReceiptsEnum.test,
    sleep: "2000"
}

if (process.argv.includes("--help")
    || process.argv.includes("-h")
    || process.argv.includes("-?")
) {
    console.log("Usage:");
    console.log();
    console.log("\tnode --unhandled-rejections=strict wsCreateStuff.js [options]");
    console.log();
    console.log("Where options can be any of:");
    console.log();
    console.log("\t--env=single|localhost*|dev|tst  single is for a single MAH on port 8081");
    console.log("\t--ignoreDups=t*|                 only for product and batch creation");
    console.log("\t--sleep=2000                     number of ms to sleep between API REST calls");
    console.log();
    console.log("\t--batches=none|test*|random");
    console.log("\t--products=none|test*");
    console.log("\t--shipments=none|test*|random");
    console.log("\t--sales=none|test*");
    console.log("\t--receipts=none|test*");
    console.log("\t--traceability=none|test*");
    console.log();
    console.log("* - is the default setting");
    process.exit(0);
}

const conf = argParser(defaultOps, process.argv);

if (conf.env === "single") {
    conf.wsPortNumber = "8081";
} else if (conf.env === "dev") {
    conf.wsDomainSuffix = "-fgt-dev.pharmaledger.pdmfc.com";
    conf.wsPortNumber = "443";
    conf.wsProtocol = "https";
} else if (conf.env === "tst") {
    conf.wsDomainSuffix = "-fgt.pharmaledger.pdmfc.com";
    conf.wsPortNumber = "443";
    conf.wsProtocol = "https";
}

if (conf.sleep) {
    SLEEP_MS = parseInt(conf.sleep);
}

/**
 * 
 * Functions
 */

// Based on
// https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

// Based on
// https://stackoverflow.com/questions/6158933/how-is-an-http-post-request-made-in-node-js
const jsonHttpRequest = function (conf, actor, { body, ...options }) {
    const bodyToSend = (body && typeof body != "string") ? JSON.stringify(body) : body;

    if (!options.headers) {
        options.headers = {
            'content-type': 'application/json',
        };
    } else if (!options.headers['content-type']) {
        options.headers['content-type'] = 'application/json';
    }
    if (bodyToSend)
        options.headers['content-length'] = Buffer.byteLength(bodyToSend);
    if (!options['hostname'])
        options.hostname = getHostnameForActor(conf, actor);
    if (!options['port'])
        options.port = conf.wsPortNumber;

    const beforeReq = new Date();
    const protocol = conf.wsProtocol;
    let p = new Promise((resolve, reject) => {
        // debug request
        console.log(protocol+" "+options.method, JSON.stringify(options), bodyToSend);
        
        const req = (protocol === "http" ? http : https).request(
            {
                ...options,
            },
            res => {
                const chunks = [];
                res.on('data', data => chunks.push(data));
                res.on('end', () => {
                    let resBody = Buffer.concat(chunks);
                    //console.log("res.headers=", res.headers);
                    const contentType = res.headers['content-type'];
                    if (contentType && contentType.startsWith('application/json')) {
                        resolve(JSON.parse(resBody.toString())); // seems to be a JSON reply. Attempt to parse.
                    } else if (contentType && contentType.startsWith('text/')) {
                        resolve(resBody.toString()); // seems to be readable text.
                    } else {
                        resolve(resBody); // don't know what content-type is this. Return it as a Buffer.
                    }
                });
            }
        );
        req.on('error', reject);
        if (bodyToSend) {
            req.write(bodyToSend);
        }
        req.end();
    });

    // debug reply
    p.then((r) => {
        const afterRes = new Date();
        const ellapsed = afterRes.getTime()-beforeReq.getTime();
        console.log(`res ${ellapsed}ms`, r);
    });

    return p;
}

const jsonGet = function (conf, actor, { body, ...options }) {
    options.method = "GET";
    return jsonHttpRequest(conf, actor, { body, ...options });
}

const jsonPost = function (conf, actor, { body, ...options }) {
    options.method = "POST";
    return jsonHttpRequest(conf, actor, { body, ...options });
}

const jsonPut = function (conf, actor, { body, ...options }) {
    options.method = "PUT";
    return jsonHttpRequest(conf, actor, { body, ...options });
}

const getHostnameForActor = function (conf, actor) {
    if (conf.env=="single") {
        return "localhost";
    }
    // test MAH
    let mahMatch = actor.email.secret.match(/^(.*)@mah.*$/);
    if (mahMatch) {
        let mahName = mahMatch[1].replace(".", "-");
        // special case merck->msd
        if (mahName === "merck")
            mahName = "msd";
        return `api-mah-${mahName}${conf.wsDomainSuffix}`;
    }
    // test WHS
    let whsMatch = actor.id.secret.match(/^WHS([0-9]+)$/);
    if (whsMatch) {
        let whsNumber = parseInt(whsMatch[1])+""; // eliminate leading zeros
        // taked is special
        if (whsNumber==="999999") 
            whsNumber = "takeda";
        return `api-whs${whsNumber}${conf.wsDomainSuffix}`;
    }
    // test PHA
    let phaMatch = actor.id.secret.match(/^PHA([0-9]+)$/);
    if (phaMatch) {
        let phaNumber = parseInt(phaMatch[1])+""; // eliminate leading zeros
        return `api-pha${phaNumber}${conf.wsDomainSuffix}`;
    }
    throw new Error("Cannot determine hostname for actor.email=" + actor.email.secret);
    //return undefined;
}

const findMahOriginalBatch = function (gtin, batchNumber) {
    //for(const mah of [MAH_MSD]) { // only MSD has good prod+batches
    for(const mah of MAHS) {
        const batches = mah.batches;
        //console.log("Lookging for "+gtin+" "+batchNumber+" in", batches);
        if (!batches) continue;
        if (gtin in batches) {
            const aBatchArray = batches[gtin];
            for (const batch of aBatchArray) {
                if (batchNumber == batch.batchNumber)
                    return batch;
            }
        }
    }
    throw new Error("Batch "+gtin+" "+batchNumber+" not found in MAHs");
}

const productCreate = async function (conf, actor, product) {
    if (!validateGtin(product.gtin)) {
        const msg = "Creating product skipping invalid GTIN "+product.gtin;
        console.log(msg);
        return { "message": msg };
    }
    const res = await jsonPost(conf, actor, {
        path: `/traceability/product/create`,
        body: { // see body example in follows http://swagger-mah-*.localhost:8080/#/product/post_product_create
            "name": product.name,
            "gtin": product.gtin,
            "description": product.description
        }
    });
    if (!res.keySSI) {
        if (conf.ignoreDups && res.message && res.message.endsWith("because it already exists.")) {
            return res;
        } else {
            throw new Error("product/create "+product.gtin+" reply has no keySSI: "+JSON.stringify(res));
        }
    }
    return res;
};

const productsCreate = async function (conf, actor) {
    if (conf.products === ProductsEnum.none) {
        return; // don't create products
    }
    if (conf.products != ProductsEnum.test) {
        throw new Error("Unsupported setting products=" + conf.products);
    }
    for (const product of actor.products) {
        await productCreate(conf, actor, product);
    }
};

const batchCreate = async function (conf, actor, gtin, batch) {
    if (!validateGtin(gtin)) {
        const msg = "Creating batch skipping invalid GTIN "+gtin+" for batchNumber "+batch.batchNumber;
        console.log(msg);
        return { "message": msg };
    }
    const res = await jsonPost(conf, actor, {
        path: `/traceability/batch/create`,
        body: { // see body example in https://swagger-mah-*-fgt-dev.pharmaledger.pdmfc.com/#/batch/post_batch_create
            "gtin": gtin,
            "batchNumber": batch.batchNumber,
            "expiry": batch.expiry,
            "serialNumbers": batch.serialNumbers
        }
    });
    if (!res.keySSI) {
        if (conf.ignoreDups && res.message && res.message.startsWith("ConstDSU already exists!")) {
            return res;
        } else {
            throw new Error("batch/create "+batch.batchNumber+" reply has no keySSI: "+JSON.stringify(res));
        }
    }
    return res;
};

const batchesCreateTest = async function (conf, actor) {
    /*
    if (actor.id.secret!="MAH136366355") {
        console.log("Not MSD");
        return;
    }
    */
    for (const [gtin, batchArray] of Object.entries(actor.batches)) {
        //console.log("Creating batch", gtin, batchArray);
        for (const batch of batchArray) {
            // fix expiry date on given test data
            let now = new Date();
            //console.log("Batch expiry before=", batch.expiry, typeof batch.expiry);
            if (!batch.expiry) {
                batch.expiry = now;
            }
            if (batch.expiry - now < 0) {
                batch.expiry.setDate(now.getDate()+365);
            }
            //console.log("Batch expiry=", batch.expiry);
            // https://github.com/PharmaLedger-IMI/fgt-workspace/issues/69
            // issue #69 seems fixed, so we no longer truncate batches
            /*
            if (batch.serialNumbers.length>3600) {
                console.log("Batch "+batch.batchNumber+" serialNumber has "+batch.serialNumbers.length+" elements. Truncating to 3600.");
                batch.serialNumbers = batch.serialNumbers.slice(0,3599);
            }
            */
            await batchCreate(conf, actor, gtin, batch);
        }
    }
}

const batchesCreateRandom = async function (conf, actor) {
    for (const product of actor.products) {
        const gtin = product.gtin;
        const batches = getBatches(); // create a new array of batches with random batchNumber and random serial numbers
        //console.log("new batches", batches);
        for (const batch of batches) {
            await batchCreate(conf, actor, gtin, batch);
            // push new batches into the mah.batches
            actor.batches[gtin].push(batch);
        }
    }
}

const batchesCreate = async function (conf, actor) {
    if (conf.batches === BatchesEnum.none) {
        return; // don't create batches
    } else if (conf.batches === BatchesEnum.test) {
        await batchesCreateTest(conf, actor);
    } else if (conf.batches === BatchesEnum.random) {
        await batchesCreateRandom(conf, actor);
    } else {
        throw new Error("Unsupported setting batches=" + conf.batches);
    }
};

const batchesUpdateTest = async function (conf, mah, mySales) {
    // recall batch of first sold item, from the given mah
    let soldProduct = undefined;
    for (const sale of mySales) {
        for (const product of sale.productList) {
            if (product.manufName == mah.id.secret) {
                soldProduct = product;
            }
        }                
        if (soldProduct) break;
    } 
    if (!soldProduct) {
        throw new Error("No sale found for "+mah.id.secret);
    }

    const resQ = await jsonPut(conf, mah, {
        path: `/traceability/batch/update/${encodeURI(soldProduct.gtin)}/${encodeURI(soldProduct.batchNumber)}`,
        body: { // see body example in https://swagger-mah-*-fgt-dev.pharmaledger.pdmfc.com/#/batch/post_batch_create
            "status": BatchStatus.QUARANTINED,
            "extraInfo": "Quarantined by a test script!"
        }
    });
    if (!resQ || !resQ.batchStatus) {
        throw new Error("batch/update "+soldProduct.batchNumber+" reply has no batchStatus: "+JSON.stringify(resQ));
    }

    console.log("Sleep "+SLEEP_MS+"ms");
    await sleep(SLEEP_MS);

    const resC = await jsonPut(conf, mah, {
        path: `/traceability/batch/update/${encodeURI(soldProduct.gtin)}/${encodeURI(soldProduct.batchNumber)}`,
        body: { // see body example in https://swagger-mah-*-fgt-dev.pharmaledger.pdmfc.com/#/batch/post_batch_create
            "status": BatchStatus.COMMISSIONED,
            "extraInfo": "Re-comissioned by a test script!"
        }
    });
    if (!resC || !resC.batchStatus) {
        throw new Error("batch/update "+soldProduct.batchNumber+" reply has no batchStatus: "+JSON.stringify(resC));
    }

    console.log("Sleep "+SLEEP_MS+"ms");
    await sleep(SLEEP_MS);

    const resR = await jsonPut(conf, mah, {
        path: `/traceability/batch/update/${encodeURI(soldProduct.gtin)}/${encodeURI(soldProduct.batchNumber)}`,
        body: { // see body example in https://swagger-mah-*-fgt-dev.pharmaledger.pdmfc.com/#/batch/post_batch_create
            "status": BatchStatus.RECALL,
            "extraInfo": "Recalled by a test script!"
        }
    });
    if (!resR || !resR.batchStatus) {
        throw new Error("batch/update "+soldProduct.batchNumber+" reply has no batchStatus: "+JSON.stringify(resR));
    }

    console.log("Sleep "+SLEEP_MS+"ms");
    await sleep(SLEEP_MS);

    return resR;
}

const batchesUpdate = async function (conf, actor, mySales) {
    if (conf.batches === BatchesEnum.none) {
        return; // don't create batches
    } else if (conf.batches === BatchesEnum.test) {
        await batchesUpdateTest(conf, actor, mySales);
    } else if (conf.batches === BatchesEnum.random) {
        await batchesUpdateTest(conf, actor, mySales);
    }
};

const shipmentCreateAndDeliver = async function(conf, sender, receiver, shipment) {
    const resC = await jsonPost(conf, sender, {
        path: `/traceability/shipment/create`,
        body: shipment
    });
    const shipmentId = resC.shipmentId;
    if (!shipmentId) {
        throw new Error("shipment/create "+shipment+" reply has no shipmentId: "+JSON.stringify(resC));
    }
    const resUPickup = await jsonPut(conf, sender, {
        path: `/traceability/shipment/update/${encodeURI(shipmentId)}`,
        body: {
            "status": ShipmentStatus.PICKUP,
            "extraInfo": "Ready to pick up by a test script"
        }
    });
    const shipmentId2 = resUPickup.shipmentId;
    if (!shipmentId2) {
        throw Error("shipment/update "+shipmentId+" reply has no shipmentId: "+JSON.stringify(resUPickup));
    }
    console.log("Sleep "+SLEEP_MS+"ms");
    await sleep(SLEEP_MS);
    const resUTransit = await jsonPut(conf, sender, {
        path: `/traceability/shipment/update/${encodeURI(shipmentId)}`,
        body: {
            "status": ShipmentStatus.TRANSIT,
            "extraInfo": "Picked up in good condition by a test script!"
        }
    });
    const shipmentId3 = resUTransit.shipmentId;
    if (!shipmentId3) {
        throw Error("shipment/update "+shipmentId+" reply has no shipmentId: "+JSON.stringify(resUTransit));
    }
    console.log("Sleep "+SLEEP_MS+"ms");
    await sleep(SLEEP_MS);
    const resUDelivered = await jsonPut(conf, sender, {
        path: `/traceability/shipment/update/${encodeURI(shipmentId)}`,
        body: {
            "status": ShipmentStatus.DELIVERED,
            "extraInfo": "Delivered in good condition by a test script!"
        }
    });
    const shipmentId4 = resUDelivered.shipmentId;
    if (!shipmentId4) {
        throw Error("shipment/update "+shipmentId+" reply has no shipmentId: "+JSON.stringify(resUDelivered));
    }
    console.log("Sleep "+SLEEP_MS+"ms");
    await sleep(SLEEP_MS);
    const resUReceived = await jsonPut(conf, receiver, {
        path: `/traceability/shipment/update/${encodeURI(shipmentId)}`,
        body: {
            "status": ShipmentStatus.RECEIVED,
            "extraInfo": "Received in good condition by a test script!"
        }
    });
    const shipmentId5 = resUReceived.shipmentId;
    if (!shipmentId5) {
        throw Error("shipment/update "+shipmentId+" reply has no shipmentId: "+JSON.stringify(resUReceived));
    }
    console.log("Sleep "+SLEEP_MS+"ms");
    await sleep(SLEEP_MS);
    const resUConfirmed = await jsonPut(conf, receiver, {
        path: `/traceability/shipment/update/${encodeURI(shipmentId)}`,
        body: {
            "status": ShipmentStatus.CONFIRMED,
            "extraInfo": "Confirmed into stock by a test script!"
        }
    });
    const shipmentId6 = resUConfirmed.shipmentId;
    if (!shipmentId6) {
        throw new Error("shipment/update "+shipmentId+" reply has no shipmentId: "+JSON.stringify(resUConfirmed));
    }

    console.log("Sleep "+SLEEP_MS+"ms");
    await sleep(SLEEP_MS);

    return resUConfirmed;
};

const shipmentsCreateTest = async function (conf, sender) {
    if (sender.id.secret != MAH_MSD.id.secret) {
        throw new Error("shipmentsCreateTest can only sell for MSD for now");
    }

    const whs = WSH1;
    const pha = PHA1;

    const shipment1MsdToWhs = {
        "orderId": whs.id.secret + "-" + (new Date()).toISOString(),
        "requesterId": whs.id.secret,
        "shipmentLines": [
            {
                "gtin": "00366582505358",
                "batch": "R034995",
                "quantity": 100
            },
            {
                "gtin": "00191778005295",
                "batch": "U002114",
                "quantity": 100
            }
        ]
    };

    await shipmentCreateAndDeliver(conf, sender, whs, shipment1MsdToWhs);

    const shipment2WhsToPha = {
        "orderId": pha.id.secret + "-" + (new Date()).toISOString(),
        "requesterId": pha.id.secret,
        "shipmentLines": [
            {
                "gtin": "00366582505358",
                "batch": "R034995",
                "quantity": 50
            },
            {
                "gtin": "00191778005295",
                "batch": "U002114",
                "quantity": 50
            }
        ]
    };

    const resShipToPha = await shipmentCreateAndDeliver(conf, whs, pha, shipment2WhsToPha);
    SHIPMENTS_ON_PHA.push(resShipToPha);
}

const shipmentsCreateRandom = async function (conf, sender) {
    if (sender.id.secret != MAH_MSD.id.secret) {
        throw new Error("shipmentsCreateTest can only sell for MSD for now");
    }

    const mahGtins = Object.keys(sender.batches);
    const mahRandomGtin = mahGtins[generateRandomInt(0, mahGtins.length)];
    const mahBatch0 = sender.batches[mahRandomGtin][0];
    const whs = WSH1;
    const pha = PHA1;
    
    const shipment1MahToWhs = {
        "orderId": whs.id.secret + "-" + (new Date()).toISOString(),
        "requesterId": whs.id.secret,
        "shipmentLines": [
            {
                "gtin": mahRandomGtin,
                "batch": mahBatch0.batchNumber,
                "quantity": 100
            }
        ]
    };

    await shipmentCreateAndDeliver(conf, sender, whs, shipment1MahToWhs);

    const shipment2WhsToPha = {
        "orderId": pha.id.secret + "-" + (new Date()).toISOString(),
        "requesterId": pha.id.secret,
        "shipmentLines": [
            {
                "gtin": mahRandomGtin,
                "batch": mahBatch0.batchNumber,
                "quantity": 50
            }
        ]
    };

    const resShipToPha = await shipmentCreateAndDeliver(conf, whs, pha, shipment2WhsToPha);
    SHIPMENTS_ON_PHA.push(resShipToPha);
}

const shipmentsCreate = async function (conf, sender) {
    if (conf.shipments === ShipmentsEnum.none) {
        return; // don't create batches
    } else if (conf.shipments === ShipmentsEnum.test) {
        await shipmentsCreateTest(conf, sender);
    } else if (conf.shipments === ShipmentsEnum.random) {
        await shipmentsCreateRandom(conf, sender);
    } else {
        throw new Error("Unsupported setting shipments=" + conf.shipments);
    }
};

/*
const salesCreateTest = async function (conf, manufActor, sellerActor, mySales) {
    const manufBatches = manufActor.batches;
    const gtin = "00366582505358";
    const batch = manufBatches[gtin][0];
    //console.log("batch", batch);

    let i=0;
    while (i<NUM_SALES) {
        const saleSerialNumber = batch.serialNumbers[i];
        const saleData = { // see body of http://swagger-pha1.localhost:8080/#/sale/post_sale_create
            "id": sellerActor.id.secret + "-" + (new Date()).toISOString(),
            "productList": [
                {
                    "gtin": gtin,
                    "batchNumber": batch.batchNumber,
                    "serialNumber": saleSerialNumber
                }
            ]
        };

        const resSale = await jsonPost(conf, sellerActor, {
            path: `/traceability/sale/create`,
            body: saleData
        });
        //console.log("Sale", resSale);
        if (!resSale || !resSale.productList) {
            throw new Error("sale/create "+batch.batchNumber+" at "+sellerActor.id.secret+" reply has no productList: "+JSON.stringify(resSale));
        }
        mySales.push(resSale);

        console.log("Sleep " + SLEEP_MS + "ms");
        await sleep(SLEEP_MS);

        i++;
    }
}
*/


const salesCreateTest = async function (conf, manufActor, sellerActor, mySales) {
    if (!SHIPMENTS_ON_PHA.length) {
        throw new Error("No shipments on pharmacies on this run!");
    }
    if (!SHIPMENTS_ON_PHA[0].shipmentLines.length) {
        throw new Error("No shipmentLines on pharmacies on this run!");
    }
    const shipmentLine0 = SHIPMENTS_ON_PHA[0].shipmentLines[0];
    const gtin = shipmentLine0.gtin;
    const batchNumber = shipmentLine0.batch;
    const batch = findMahOriginalBatch(gtin, batchNumber);
    //console.log("batch", batch);

    let i=0;
    while (i<NUM_SALES) {
        const saleSerialNumber = batch.serialNumbers[i];
        const saleData = { // see body of http://swagger-pha1.localhost:8080/#/sale/post_sale_create
            "id": sellerActor.id.secret + "-" + (new Date()).toISOString(),
            "productList": [
                {
                    "gtin": gtin,
                    "batchNumber": batch.batchNumber,
                    "serialNumber": saleSerialNumber
                }
            ]
        };

        const resSale = await jsonPost(conf, sellerActor, {
            path: `/traceability/sale/create`,
            body: saleData
        });
        //console.log("Sale", resSale);
        if (!resSale || !resSale.productList) {
            throw new Error("sale/create "+batch.batchNumber+" at "+sellerActor.id.secret+" reply has no productList: "+JSON.stringify(resSale));
        }
        mySales.push(resSale);

        console.log("Sleep " + SLEEP_MS + "ms");
        await sleep(SLEEP_MS);

        i++;
    }
}

const salesCreate = async function (conf, manufActor, sellerActor, mySales) {
    if (conf.sales === SalesEnum.none) {
        return; // don't create sales
    } else if (conf.sales === SalesEnum.test) {
        await salesCreateTest(conf, manufActor, sellerActor, mySales);
    } else {
        throw new Error("Unsupported setting sales=" + conf.sales);
    }
};

const traceabilityCreateTest = async function (conf, actor, mySales) {
    for (const sale of mySales) {
        for (const product of sale.productList) {
            const res = await jsonPost(conf, actor, {
                path: `/traceability/traceability/create`,
                body: {
                    "gtin": product.gtin,
                    "batchNumber": product.batchNumber
                }
            });
            //console.log("Trc", res);
            if (!res["1"]) {
                throw new Error("traceability/create "+product.batchNumber+" at "+actor.id.secret+" reply has no data: "+JSON.stringify(res));
            }
            console.log("Sleep " + SLEEP_MS + "ms");
            await sleep(SLEEP_MS);
        }
    }
};

const traceabilityCreate = async function (conf, actor, mySales) {
    if (conf.traceability === TraceabilityEnum.none) {
        return; // don't create tracebility requests
    } else if (conf.traceability === TraceabilityEnum.test) {
        await traceabilityCreateTest(conf, actor, mySales);
    } else {
        throw new Error("Unsupported setting traceability=" + conf.sales);
    }
};

const receiptsGetTest = async function (conf, actor, mySales) {
    for (const sale of mySales) {
        for (const product of sale.productList) {
            const res = await jsonGet(conf, actor, {
                path: `/traceability/receipt/get/${encodeURI(product.gtin)}/${encodeURI(product.batchNumber)}/${encodeURI(product.serialNumber)}`,
            });
            //console.log("Rec", res);
            if (!res.sellerId) {
                throw new Error("receipt/get "+product.batchNumber+" at "+actor.id.secret+" reply has no data: "+JSON.stringify(res));
            }
            console.log("Sleep " + SLEEP_MS + "ms");
            await sleep(SLEEP_MS);
        }
    }
};

const receiptsGet = async function (conf, actor, mySales) {
    if (conf.receipts === ReceiptsEnum.none) {
        return; // don't create tracebility requests
    } else if (conf.receipts === ReceiptsEnum.test) {
        await receiptsGetTest(conf, actor, mySales);
    } else {
        throw new Error("Unsupported setting receipts=" + conf.sales);
    }
};


/**
 * Main
 */
// block on console.log - see https://github.com/nodejs/node/issues/11568
process.stdout._handle.setBlocking(true);

(async () => {
    //console.log("Credentials", MAHS);
    //console.log("Products", products.getPfizerProducts());
    //console.log("Batches", MAH_MSD.batches);
    for (const mah of MAHS) {
        await productsCreate(conf, mah);
        await batchesCreate(conf, mah);
    };

    // product and batch creation needs no sleep pauses.
    // But we should pause a while before attempting to ship anything.
    console.log("Sleep " + SLEEP_MS + "ms");
    await sleep(SLEEP_MS);

    await shipmentsCreate(conf, MAH_MSD);
    await salesCreate(conf, MAH_MSD, PHA1, MY_SALES);
    await traceabilityCreate(conf, PHA1, MY_SALES);
    await receiptsGet(conf, PHA1, MY_SALES);

    await batchesUpdate(conf, MAH_MSD, MY_SALES);
})();
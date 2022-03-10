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

const { argParser, genDate } = require('./utils');

const ShipmentStatus = require('../../fgt-dsu-wizard/model/ShipmentStatus')

const credentials = require('./credentials/credentialsTests'); // TODO require ../../docker/api/env/mah-*.json ?
const MAHS = [credentials.PFIZER, credentials.MSD, credentials.ROCHE, credentials.BAYER, credentials.NOVO_NORDISK, credentials.GSK, credentials.TAKEDA];
const WSH1 = require("../../docker/api/env/whs-1.json");
const WSH2 = require("../../docker/api/env/whs-2.json");
const PHA1 = require("../../docker/api/env/pha-1.json");
const PHA2 = require("../../docker/api/env/pha-2.json");

const NUM_SALES = 2; // number of sales to perform - for now consume serialNumbers from 1st MSD batch
const MY_SALES = []; // array of data returned by /sale/create

const SLEEP_MS = 5000;

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
};

class SalesEnum {
    static none = "none";
    static test = "test";
};

const defaultOps = {
    wsProtocol: "http",
    wsDomainSuffix: ".localhost",
    wsPortNumber: "8080",
    env: "localhost",
    products: ProductsEnum.test,
    batches: BatchesEnum.test,
    shipments: ShipmentsEnum.test,
    sales: SalesEnum.test
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
    console.log("\t--batches=none|test*|random");
    console.log("\t--env=localhost*|dev|tst");
    console.log("\t--products=none|test*");
    console.log("\t--shipments=none|test*");
    console.log("\t--sales=none|test*");
    console.log();
    console.log("* - is the default setting");
    process.exit(0);
}

const conf = argParser(defaultOps, process.argv);

if (conf.env === "dev") {
    conf.wsDomainSuffix = "-fgt-dev.pharmaledger.pdmfc.com";
    conf.wsPortNumber = "443";
    conf.wsProtocol = "https";
} else if (conf.env === "tst") {
    conf.wsDomainSuffix = "-fgt.pharmaledger.pdmfc.com";
    conf.wsPortNumber = "443";
    conf.wsProtocol = "https";
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
    options.headers['content-length'] = Buffer.byteLength(bodyToSend);
    if (!options['hostname'])
        options.hostname = getHostnameForActor(conf, actor);
    if (!options['port'])
        options.port = conf.wsPortNumber;

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
                        resolve(JSON.parse(resBody)); // seems to be a JSON reply. Attempt to parse.
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
        console.log("res", r);
    });

    return p;
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
    throw Error("Cannot determine hostname for actor.email=" + actor.email.secret);
    //return undefined;
}

const productCreate = async function (conf, actor, product) {
    const res = await jsonPost(conf, actor, {
        path: `/traceability/product/create`,
        body: { // see body example in follows http://swagger-mah-*.localhost:8080/#/product/post_product_create
            "name": product.name,
            "gtin": product.gtin,
            "description": product.description
        }
    });
    return res;
};

const productsCreate = async function (conf, actor) {
    if (conf.products === ProductsEnum.none) {
        return; // don't create products
    }
    if (conf.products != ProductsEnum.test) {
        throw Error("Unsupported setting products=" + conf.products);
    }
    for (const product of actor.products) {
        await productCreate(conf, actor, product);
    }
};

const batchCreate = async function (conf, actor, gtin, batch) {
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
        throw Error("batch/create "+batch.batchNumber+" reply has no keySSI: "+JSON.stringify(res));
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
        const batches = getBatches();
        for (const batch of batches) {
            await batchCreate(conf, actor, gtin, batch);
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
        throw Error("Unsupported setting batches=" + conf.batches);
    }
};

const shipmentCreateAndDeliver = async function(conf, sender, receiver, shipment) {
    const resC = await jsonPost(conf, sender, {
        path: `/traceability/shipment/create`,
        body: shipment
    });
    const shipmentId = resC.shipmentId;
    if (!shipmentId) {
        throw Error("create/shipment "+shipment+" reply has no shipmentId: "+JSON.stringify(resC));
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
        throw Error("update/shipment "+shipmentId+" reply has no shipmentId: "+JSON.stringify(resUPickup));
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
        throw Error("update/shipment "+shipmentId+" reply has no shipmentId: "+JSON.stringify(resUTransit));
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
        throw Error("update/shipment "+shipmentId+" reply has no shipmentId: "+JSON.stringify(resUDelivered));
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
        throw Error("update/shipment "+shipmentId+" reply has no shipmentId: "+JSON.stringify(resUReceived));
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
        throw Error("update/shipment "+shipmentId+" reply has no shipmentId: "+JSON.stringify(resUConfirmed));
    }

    console.log("Sleep "+SLEEP_MS+"ms");
    await sleep(SLEEP_MS);
};

const shipmentsCreateTest = async function (conf) {
    const msd = credentials.MSD;
    const whs1 = WSH1;
    const pha1 = PHA1;

    const shipment1MsdToWhs1 = {
        "orderId": whs1.id.secret + "-" + (new Date()).toISOString(),
        "requesterId": WSH1.id.secret,
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

    await shipmentCreateAndDeliver(conf, msd, whs1, shipment1MsdToWhs1);

    const shipment2Whs1ToPha1 = {
        "orderId": pha1.id.secret + "-" + (new Date()).toISOString(),
        "requesterId": PHA1.id.secret,
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

    await shipmentCreateAndDeliver(conf, whs1, pha1, shipment2Whs1ToPha1);
}

const shipmentsCreate = async function (conf, actor) {
    if (conf.shipments === ShipmentsEnum.none) {
        return; // don't create batches
    } else if (conf.shipments === ShipmentsEnum.test) {
        await shipmentsCreateTest(conf, actor);
    } else {
        throw Error("Unsupported setting shipments=" + conf.shipments);
    }
};

const salesCreateTest = async function (conf) {
    const pha1 = PHA1;

    const msdBatches = credentials.MSD.batches;
    const gtin = "00366582505358";
    const batch = msdBatches[gtin][0];
    //console.log("batch", batch);

    let i=0;
    while (i<NUM_SALES) {
        const saleSerialNumber = batch.serialNumbers[i];
        const saleData = { // see body of http://swagger-pha1.localhost:8080/#/sale/post_sale_create
            "id": pha1.id.secret + "-" + (new Date()).toISOString(),
            "productList": [
                {
                    "gtin": gtin,
                    "batchNumber": batch.batchNumber,
                    "serialNumber": saleSerialNumber
                }
            ]
        };

        const resSale = await jsonPost(conf, pha1, {
            path: `/traceability/sale/create`,
            body: saleData
        });
        //console.log("Sale", resSale);
        MY_SALES.push(resSale);

        console.log("Sleep " + SLEEP_MS + "ms");
        await sleep(SLEEP_MS);

        i++;
    }
}

const salesCreate = async function (conf, actor) {
    if (conf.sales === SalesEnum.none) {
        return; // don't create sales
    } else if (conf.sales === SalesEnum.test) {
        await salesCreateTest(conf, actor);
    } else {
        throw Error("Unsupported setting sales=" + conf.sales);
    }
};


/**
 * Main
 */

(async () => {
    //console.log("Credentials", MAHS);
    //console.log("Products", products.getPfizerProducts());
    for (const mah of MAHS) {
        await productsCreate(conf, mah);
        await batchesCreate(conf, mah);
    };

    const mah = credentials.MSD; // not actually used for now
    await shipmentsCreate(conf, mah);
    await salesCreate(conf, mah);
})();
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

const { argParser } = require('./utils');


const credentials = require('./credentials/credentialsTests');
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

const defaultOps = {
    wsProtocol: "http",
    wsDomainSuffix: ".localhost",
    wsPortNumber: "8080",
    env: "localhost",
    products: "test",
    batches: "test"
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
// https://stackoverflow.com/questions/6158933/how-is-an-http-post-request-made-in-node-js
const jsonPost = function (conf, actor, { body, ...options }) {
    const bodyToSend = (body && typeof body != "string") ? JSON.stringify(body) : body;

    if (!options.headers) {
        options.headers = {
            'content-type': 'application/json',
        };
    } else if (!options.headers['content-type']) {
        options.headers['content-type']='application/json';
    }
    if (!options['hostname'])
        options.hostname = getHostnameForActor(conf, actor);
    if (!options['port'])
        options.port = conf.wsPortNumber;

    let p = new Promise((resolve, reject) => {
        // debug request
        console.log("http post", JSON.stringify(options));

        const req = (conf.wsProtocol==="http"?http:https).request({
            method: 'POST',
            ...options,
        }, res => {
            const chunks = [];
            res.on('data', data => chunks.push(data));
            res.on('end', () => {
                let resBody = Buffer.concat(chunks);
                switch (res.headers['content-type']) {
                    case 'application/json':
                        resBody = JSON.parse(resBody);
                        break;
                }
                resolve(resBody)
            });
        });
        req.on('error', reject);
        if (bodyToSend) {
            req.write(bodyToSend);
        }
        req.end();
    });

    // debug reply
    p.then( (r) => {
        if (Buffer.isBuffer(r)) {
            console.log("resB", r.toString());
        } else {
            console.log("res", r);
        }
    });

    return p;
}

const getHostnameForActor = function (conf, actor) {
    // test MAH
    let emailMatch = actor.email.secret.match(/^(.*)@mah.*$/);
    if (emailMatch) {
        let mahName = emailMatch[1].replace(".","-");
        // special case merck->msd
        if (mahName==="merck")
            mahName="msd";
        return `api-mah-${mahName}${conf.wsDomainSuffix}`;
    }
    return undefined;
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
    if (conf.products===ProductsEnum.none) {
        return; // don't create products
    }
    if (conf.products!=ProductsEnum.test) {
        throw Error("Unsupported setting products="+conf.products);
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
    return res;
};

const batchesCreateTest = async function (conf, actor) {
    for (const [gtin, batchArray] of Object.entries(actor.batches)) {
        //console.log("Creating batch", gtin, batchArray);
        for (const batch of batchArray) {
            await batchCreate(conf, actor, gtin, batch);
        }
    }
}

const batchesCreateRandom = async function (conf, actor) {
    for(const product of actor.products) {
        const gtin = product.gtin;
        const batches = getBatches();
        for(const batch of batches) {
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


/**
 * Main
 */

(async () => {
    const MAHS = [credentials.PFIZER, credentials.MSD, credentials.ROCHE, credentials.BAYER, credentials.NOVO_NORDISK, credentials.GSK, credentials.TAKEDA];
    //console.log("Credentials", MAHS);
    //console.log("Products", products.getPfizerProducts());
    for (const mah of MAHS) {
        await productsCreate(conf, mah);
        await batchesCreate(conf, mah);
    };
})();
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

const defaultOps = {
    wsProtocol: "http",
    wsDomainSuffix: ".localhost",
    wsPortNumber: "8080",
    wsEnv: "localhost"
}

const conf = argParser(defaultOps, process.argv);

if (conf.wsEnv === "dev") {
    conf.wsDomainSuffix = "-fgt-dev.pharmaledger.pdmfc.com";
    conf.wsPortNumber = "443";
    conf.wsProtocol = "https";
} else if (conf.wsEnv === "tst") {
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
    if (emailMatch)
        return `api-mah-${emailMatch[1].replace(".","-")}${conf.wsDomainSuffix}`;
    return undefined;
}

const productCreate = async function (conf, actor, product) {
    const res = jsonPost(conf, actor, {
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
    let products = [...actor.products];
    while (products.length > 0) {
        const product = products.shift();
        let res = await productCreate(conf, actor, product);
    }
};


/**
 * Main
 */

(async () => {
    const MAHS = [credentials.PFIZER, credentials.MSD, credentials.ROCHE, credentials.BAYER, credentials.NOVO_NORDISK, credentials.GSK, credentials.TAKEDA];
    console.log("Credentials", MAHS);
    //console.log("Products", products.getPfizerProducts());
    let mahArray = [...MAHS];
    while (mahArray.length > 0) {
        const mah = mahArray.shift();
        await productsCreate(conf, mah);
    };
})();

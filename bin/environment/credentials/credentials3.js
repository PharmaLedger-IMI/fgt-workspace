const generateWholesalerCredentials = function(id) {
    return {
        "name": {
            "secret": "PDM the Wholesaler",
            "public": true,
            "required": true
        },
        "id": {
            "secret": `WHS${id}`,
            "public": true,
            "required": true
        },
        "email": {
            "secret": "wholesaler@pdmfc.com",
            "public": true,
            "required": true
        },
        "tin": {
            "secret": 5000000000,
            "public": true,
            "required": true
        },
        "address": {
            "required": true,
            "public": true,
            "secret": "London, England"
        },
        "pass": {
            "required": true,
            "secret": "This1sSuchAS3curePassw0rd"
        },
        "passrepeat": {
            "required": true,
            "secret": "This1sSuchAS3curePassw0rd"
        },
    }
};

const generatePharmacyCredentials = function(id) {
    return {
        "name": {
            "secret": "PDM the Pharmacy",
            "public": true,
            "required": true
        },
        "id": {
            "secret": `PHA${id}`,
            "public": true,
            "required": true
        },
        "email": {
            "secret": "pharmacy@pdmfc.com",
            "public": true,
            "required": true
        },
        "tin": {
            "secret": 5000000000,
            "public": true,
            "required": true
        },
        "address": {
            "required": true,
            "public": true,
            "secret": "Avenida da Liberdade, Lisboa, Portugal"
        },
        "pass": {
            "required": true,
            "secret": "This1sSuchAS3curePassw0rd"
        },
        "passrepeat": {
            "required": true,
            "secret": "This1sSuchAS3curePassw0rd"
        }
    }
};

const generateMAHCredentials = function(id) {
    return {
        "name": {
            "secret": "PDM the MAH",
            "public": true,
            "required": true
        },
        "id": {
            "secret": `MAH${id}`,
            "public": true,
            "required": true
        },
        "email": {
            "secret": "mah@pdmfc.com",
            "public": true,
            "required": true
        },
        "tin": {
            "secret": 5000000000,
            "public": true,
            "required": true
        },
        "address": {
            "required": true,
            "public": true,
            "secret": "New York, USA"
        },
        "pass": {
            "required": true,
            "secret": "This1sSuchAS3curePassw0rd"
        },
        "passrepeat": {
            "required": true,
            "secret": "This1sSuchAS3curePassw0rd"
        }
    }
};

const APPS = {
    MAH: 'fgt-mah-wallet',                  // instantiates a MAH with random content
    WHOLESALER: 'fgt-wholesaler-wallet',    // instantiates a Wholesaler with random content
    PHARMACY: 'fgt-pharmacy-wallet',        // instantiates a Pharmacy with random content
    MULTIPLE: 'multiple',                   // instantiates a Multiple connected Actors
    SINGLE: 'single',                       // instantiates a One of each actors, connected
    SIMPLE_TRACEABILITY: 'traceability',    // instantiates a Single Env where an extra WHOLESALER (prefix FAC) will have all stock from all products/batches for each MAH, so we can simulate que consecutive shipments, orders, etc
    PROD: 'prod'                            // instantiates a the Production Env
}

const PROD = {}
PROD[APPS.MAH] = {
}

const getDummyWholesalers = function(count){
    count = count || 1;
    const result = [];
    for (let i=0; i < count; i++){
        result.push(getCredentials(APPS.WHOLESALER))
    }
    return result;
}

const getCredentials = function(type, reference){
    if (typeof reference === 'string')
        return PROD[type][reference];
    switch (type){
        case APPS.WHOLESALER:
            return generateWholesalerCredentials(Math.floor(Math.random() * 999999999));
        case APPS.MAH:
            return generateMAHCredentials(Math.floor(Math.random() * 999999999));
        case APPS.PHARMACY:
            return generatePharmacyCredentials(Math.floor(Math.random() * 999999999));
        default:
            return;
    }
}

module.exports = {
    getCredentials,
    APPS,
    getDummyWholesalers
}
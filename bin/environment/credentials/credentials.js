const generateWholesalerCredentials = function(id) {
    return {
        "name": {
            "secret": "PDM the Wholesaler",
            "public": true,
            "required": true
        },
        "id": {
            "secret": id,
            "public": true,
            "required": true
        },
        "email": {
            "secret": "wholesaler@pdmfc.com",
            "public": true,
            "required": true
        },
        "tin": {
            "secret": 500000000,
            "public": true,
            "required": true
        },
        "address": {
            "required": true,
            "secret": "This in an Address"
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
            "secret": id,
            "public": true,
            "required": true
        },
        "email": {
            "secret": "pharmacy@pdmfc.com",
            "public": true,
            "required": true
        },
        "tin": {
            "secret": 500000000,
            "public": true,
            "required": true
        },
        "address": {
            "required": true,
            "secret": "This in an Address"
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
            "secret": id,
            "public": true,
            "required": true
        },
        "email": {
            "secret": "mah@pdmfc.com",
            "public": true,
            "required": true
        },
        "tin": {
            "secret": 500000000,
            "public": true,
            "required": true
        },
        "address": {
            "required": true,
            "secret": "This in an Address"
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
    MAH: 'fgt-mah-wallet',
    WHOLESALER: 'fgt-wholesaler-wallet',
    PHARMACY: 'fgt-pharmacy-wallet',
    MULTIPLE: 'multiple',
    SINGLE: 'single',
    PROD: 'prod'
}

const MERKL = {
    "name": {
        "secret": "Merkl",
        "public": true,
        "required": true
    },
    "id": {
        "secret": 'MERKL id',
        "public": true,
        "required": true
    },
    "email": {
        "secret": "mah@merkl.com",
        "public": true,
        "required": true
    },
    "tin": {
        "secret": 1234566789,
        "public": true,
        "required": true
    },
    "address": {
        "required": true,
        "secret": "merkl's address"
    },
    "pass": {
        "required": true,
        "secret": "MerklPassw0rd"
    },
    "passrepeat": {
        "required": true,
        "secret": "MerklPassw0rd"
    },
    products: require('../products/productsRandom'),
    batches: undefined,
}

const PROD = {}
PROD[APPS.MAH] = [MERKL]

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
    APPS
}
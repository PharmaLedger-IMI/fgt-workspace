const {generateBatchNumber} = require('./../utils')
const {getPfizerProducts, getMSDProducts, getRocheProducts, getNovoNordiskProducts, getBayerProducts} = require('../products/productsTests');
const {getPfizerBatches, getMSDBatches, getRocheBatches, getBayerBatches, getNovoNordiskBatches} = require('../batches/batchesTests');


const CITY_LIST = [
    "Lisbon, Portugal",
    "Porto, Portugal",
    "London, England",
    "Berlin, Germany",
    "Prague, Czech Republic",
    "Cape Town, South Africa",
    "Budapest, Hungary",
    "Baghdad, Iraq",
    "Campinas, Brasil",
    "Bangkok, Thailand",
    "Santiago, Chile",
    "Hong Kong, China",
    "Bucharest, Romenia",
    "Casablanca, Marocco",
    "Madrid, Spain",
    "Moscow, Russia",
    "Paris, France",
    "Warsaw, Poland",
    "Dublin, Ireland"
]

const PHARMACY_NAMES = [
    "Best Care Pharmacy",
    "Healthy Pharmacy",
    "Generation Pharmacy",
    "Medilane Pharmacy",
    "Grand Health",
    "Center Pharmacy",
    "Kings Pharmacy",
    "Downtown Pharmacy",
    "278 Pharmacy",
    "Avalon Chemists",
    "People Choice Pharmacy",
    "Allergy Pharmacy"
]

const WHOLESALER_NAMES = [
    "Wholesale Solutions",
    "The Wholesale Bazaar, Co.",
    "Budget Wholesale",
    "Wholesale Dealers",
    "Wholesale Store",
    "The Wholesale Merchant Co.",
    "SignifiSale",
    "LiveSale Company",
    "The General Wholesale Co.",
    "Applied Wholesale",
    "The Wholesale Buys Co."
]

const getRandomFromList = function(list){
    return list[Math.floor(Math.random() * list.length)];
}

const getRandomAddress = function(){
    return getRandomFromList(CITY_LIST);
}

const getRandomWholesalerName = function(){
    return getRandomFromList(WHOLESALER_NAMES);
}

const getRandomPharmacyName = function(){
    return getRandomFromList(PHARMACY_NAMES);
}

const PFIZER =  {
    "name": {
        "secret": "Pfizer, Inc.",
        "public": true,
        "required": true
    },
    "id": {
        "secret": `MAH135315170`,
        "public": true,
        "required": true
    },
    "email": {
        "secret": "pfizer@mah.pharmaledger.com",
        "public": true,
        "required": true
    },
    "address": {
        "required": true,
        "public": true,
        "secret": "New York City, New York, USA"
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

PFIZER.products = getPfizerProducts(PFIZER.id.secret);
PFIZER.batches = getPfizerBatches();

const ROCHE =  {
    "name": {
        "secret": "F. Hoffmann-La Roche AG",
        "public": true,
        "required": true
    },
    "id": {
        "secret": `MAH116267986`,
        "public": true,
        "required": true
    },
    "email": {
        "secret": "roche@mah.pharmaledger.com",
        "public": true,
        "required": true
    },
    "address": {
        "required": true,
        "public": true,
        "secret": "Basel, Switzerland"
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

ROCHE.products = getRocheProducts(ROCHE.id.secret);
ROCHE.batches = getRocheBatches();


const MSD =  {
    "name": {
        "secret": "Merck & Co., Inc.",
        "public": true,
        "required": true
    },
    "id": {
        "secret": `MAH136366355`,
        "public": true,
        "required": true
    },
    "email": {
        "secret": "merck@mah.pharmaledger.com",
        "public": true,
        "required": true
    },
    "address": {
        "required": true,
        "public": true,
        "secret": "Kenilworth, New Jersey, USA"
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

MSD.products = getMSDProducts(MSD.id.secret);
MSD.batches = getMSDBatches();

const BAYER =  {
    "name": {
        "secret": "Bayer Corp",
        "public": true,
        "required": true
    },
    "id": {
        "secret": `MAH251339219`,
        "public": true,
        "required": true
    },
    "email": {
        "secret": "bayer@mah.pharmaledger.com",
        "public": true,
        "required": true
    },
    "address": {
        "required": true,
        "public": true,
        "secret": "Pittsburg, Pennsylvania"
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

BAYER.products = getBayerProducts(BAYER.id.secret);
BAYER.batches = getBayerBatches();

const NOVO_NORDISK =  {
    "name": {
        "secret": "Novo Nordisk A/S",
        "public": true,
        "required": true
    },
    "id": {
        "secret": `MAH24256790`,
        "public": true,
        "required": true
    },
    "email": {
        "secret": "novo.nordisk@mah.pharmaledger.com",
        "public": true,
        "required": true
    },
    "address": {
        "required": true,
        "public": true,
        "secret": "Bagsvaerd, Denmark"
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

NOVO_NORDISK.products = getNovoNordiskProducts(NOVO_NORDISK.id.secret);
NOVO_NORDISK.batches = getNovoNordiskBatches();


const generateWholesalerCredentials = function(id, name , email, address) {
    return {
        "name": {
            "secret": name || getRandomWholesalerName(),
            "public": true,
            "required": true
        },
        "id": {
            "secret": `WHS${id || generateBatchNumber(8)}`,
            "public": true,
            "required": true
        },
        "email": {
            "secret": (email || "wholesaler") + "@whs.pharmaledger.com",
            "public": true,
            "required": true
        },
        "address": {
            "required": true,
            "public": true,
            "secret": address || getRandomAddress()
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

const generatePharmacyCredentials = function(id, name , email , address) {
    return {
        "name": {
            "secret": name || getRandomPharmacyName(),
            "public": true,
            "required": true
        },
        "id": {
            "secret": `PHA${id || generateBatchNumber(8)}`,
            "public": true,
            "required": true
        },
        "email": {
            "secret": (email || "pharmacy") + "@pha.pharmaledger.com",
            "public": true,
            "required": true
        },
        "address": {
            "required": true,
            "public": true,
            "secret": address || getRandomAddress()
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

module.exports = {
    generateWholesalerCredentials,
    generatePharmacyCredentials,
    MSD,
    PFIZER,
    ROCHE,
    BAYER,
    NOVO_NORDISK
}
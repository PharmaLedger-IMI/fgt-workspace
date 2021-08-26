const Product = require('../../../fgt-dsu-wizard/model/Product');

const mergeManufInfo = function(productArr, mahName){
    return productArr.map(p => new Product(Object.assign({
        manufName: mahName
    }, p)));
}

const MSDProducts = [
    {
        gtin: '00366582505358',
        name: 'Bridion',
        description: 'Injectable Solution 100mg/ml x 10 2ml vials'
    },
    {
        gtin: '00191778005295',
        name: 'Gardasil 9',
        description: 'Injectable suspension, pre-filled syringe, 0,5ml'
    },
    {
        gtin: '00191778020380',
        name: 'Bridion',
        description: '100MG/ML 10X2ML VIAL ESP/IRL'
    },
    {
        gtin: '00191778001693',
        name: 'Gardasil 9',
        description: '0.5ML 1DOSE SYR L68'
    },
]

const getMSDProducts = function(manufName = "MAH136366355"){
    return mergeManufInfo(MSDProducts, manufName);
}

const PfizerProducts = [
    {
        gtin: '08470007909231',
        name: 'Diflucan',
        description: '40mg/ml POS 1x35ml PBTL ES'
    },
    {
        gtin: '05415062336861',
        name: 'Depo Medrol',
        description: '40mg'
    }
];

const getPfizerProducts = function(manufName = "MAH135315170"){
    return mergeManufInfo(PfizerProducts, manufName);
}

const RocheProducts = [
    {
        gtin: '07613326021746',
        name: 'Perjeta',
        description: '420MG/14ML 1VIAL'
    },
    {
        gtin: '07613326022279',
        name: 'Roactem',
        description: '400MG/20ML 1VIAL IV'
    },
    {
        gtin: '07613326015547',
        name: 'Madopar',
        description: '200/50MG 30TABL'
    },
    {
        gtin: '07613326021647',
        name: 'Rocaltro',
        description: '0.25MCG 30CAPS PT'
    },
    {
        gtin: '08470006506035',
        name: 'Avastin',
        description: '400MG/16ML 1VIAL'
    },
    {
        gtin: '08470007710226',
        name: 'Cellcept',
        description: '1000MG/5ML 175SYRD'
    }
];

const getRocheProducts = function(manufName = "MAH116267986"){
    return mergeManufInfo(RocheProducts, manufName);
}

module.exports = {
    getPfizerProducts,
    getMSDProducts,
    getRocheProducts
}
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
        gtin: '00191778005295',
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

module.exports = {
    getPfizerProducts,
    getMSDProducts
}
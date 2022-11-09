
const Batch = require('../../../fgt-dsu-wizard/model/Batch');
const BatchStatus = require('../../../fgt-dsu-wizard/model/BatchStatus')
const {generateGtin} = require('../utils')

const MSD_BATCHES = {
    "00366582505358": [
        {
            batchNumber: "R034995",
            quantity: 3542,
            expiry: "2028/08/31"
        },
        {
            batchNumber: "S002961",
            quantity: 2692,
            expiry: "2028/10/31"
        },
        {
            batchNumber: "S006749",
            quantity: 4042,
            expiry: "2025/11/31"
        }
    ],
    "00191778005295": [
        {
            batchNumber: "U002114",
            quantity: 44776,
            expiry: "2023/08/31"
        },
        {
            batchNumber: "U008604",
            quantity: 46070,
            expiry: "2023/10/31"
        }
    ],
    "00191778020380": [
        {
            batchNumber: "U002872",
            quantity: 11167,
            expiry: "2023/07/31"
        },
        {
            batchNumber: "U011610",
            quantity: 8205,
            expiry: "2023/10/31"
        },
        {
            batchNumber: "U018760",
            quantity: 12694,
            expiry: "2023/11/30"
        }
    ],
    "00191778001693": [
        {
            batchNumber: "T039771",
            quantity: 153816,
            expiry: "2023/07/31"
        },
        {
            batchNumber: "U011389",
            quantity: 162355,
            expiry: "2023/10/31"
        }
    ]
}

const PFIZER_BATCHES = {
    "08470007909231": [
        {
            batchNumber: "DIF1",
            quantity: 5000,
            expiry: "2023/01/01"
        },
        {
            batchNumber: "DIF2",
            quantity: 3000,
            expiry: "2023/05/01"
        },
        {
            batchNumber: "DIF3",
            quantity: 1500,
            expiry: "2023/07/01"
        },
        {
            batchNumber: "DIF4",
            quantity: 8000,
            expiry: "2023/09/01"
        },
        {
            batchNumber: "DIF5",
            quantity: 4500,
            expiry: "2024/01/01"
        }
    ],
    "05415062336861": [
        {
            batchNumber: "DP1",
            quantity: 200,
            expiry: "2023/01/01"
        },
        {
            batchNumber: "DP2",
            quantity: 600,
            expiry: "2023/05/01"

        },
        {
            batchNumber: "DP3",
            quantity: 1000,
            expiry: "2023/07/01"
        },
        {
            batchNumber: "DP4",
            quantity: 300,
            expiry: "2023/09/01"
        },
        {
            batchNumber: "DP5",
            quantity: 2000,
            expiry: "2024/01/01"
        }
    ]
}

const ROCHE_BATCHES = {
    '07613326021746': [
        {
            batchNumber: "H0513H03",
            quantity: 8,
            expiry: "2023/04/30"
        }
    ],
    '07613326022279': [
        {
            batchNumber: "B4016H39",
            quantity: 5,
            expiry: "2023/09/30"
        }
    ],
    '07613326015547': [
        {
            batchNumber: "E0678E1",
            quantity: 50,
            expiry: "2024/03/31"
        }
    ],
    '07613326021647': [
        {
            batchNumber: "B2333B01",
            quantity: 30,
            expiry: "2023/04/30"
        }
    ],
    '08470006506035': [
        {
            batchNumber: "N7475H04",
            quantity: 10,
            expiry: "2022/06/30"
        }
    ],
    '08470007710226': [
        {
            batchNumber: "N1575B01",
            quantity: 10,
            expiry: "2029/10/31"
        }
    ]
}


const BAYER_BATCHES = {
    '06770007904242': [
        {
            batchNumber: "E03F8",
            quantity: 1200,
            expiry: "2029/04/09"
        },
        {
            batchNumber: "E04H7",
            quantity: 1500,
            expiry: "2024/05/01"
        }
    ],
    '06815062335321': [
        {
            batchNumber: "E08C6",
            quantity: 1200,
            expiry: "2023/09/01"
        },
        {
            batchNumber: "E05C1",
            quantity: 1500,
            expiry: "2023/02/05"
        }
    ]
}

const NOVO_NORDISK_BATCHES = {
    '04570007903560': [
        {
            batchNumber: "R23011",
            quantity: 800,
            expiry: "2023/05/09"
        },
        {
            batchNumber: "R56217",
            quantity: 450,
            expiry: "2024/07/01"
        }
    ],
    '08515062336321': [
        {
            batchNumber: "R15683",
            quantity: 700,
            expiry: "2023/02/01"
        },
        {
            batchNumber: "R94214",
            quantity: 650,
            expiry: "2023/08/05"
        }
    ]
}

const GSK_BATCHES = {
    '05054626551625': [
        {
            batchNumber: "DB1",
            quantity: 200,
            expiry: "2022/10/31"
        },
        {
            batchNumber: "DB4",
            quantity: 350,
            expiry: "2022/08/31"
        }
    ],
    '05054626551632': [
        {
            batchNumber: "DB2",
            quantity: 250,
            expiry: "2022/12/01"
        },
        {
            batchNumber: "DB5",
            quantity: 225,
            expiry: "2022/07/31"
        }
    ],
    '05054626551649': [
        {
            batchNumber: "DB3",
            quantity: 300,
            expiry: "2022/08/31"
        },
        {
            batchNumber: "DB6",
            quantity: 325,
            expiry: "2022/05/31"
        }
    ]
}


const TAKEDA_BATCHES = {
    '09870007904172': [
        {
            batchNumber: "R23011",
            quantity: 1400,
            expiry: "2023/05/31"
        },
        {
            batchNumber: "R56217",
            quantity: 1450,
            expiry: "2024/08/01"
        }
    ],
    '06515062342189': [
        {
            batchNumber: "R15683",
            quantity: 1700,
            expiry: "2023/03/01"
        },
        {
            batchNumber: "R94214",
            quantity: 1650,
            expiry: "2023/08/31"
        }
    ]
}

const SANOFI_BATCHES = {
    '78960706077670': [
        {
            batchNumber: "LC90001",
            quantity: 50,
            expiry: "2023/05/31"
        },
        {
            batchNumber: "LC90001",
            quantity: 200,
            expiry: "2024/08/01"
        }
    ],
    '78910580052218': [
        {
            batchNumber: "COG41A01",
            quantity: 1700,
            expiry: "2024/03/01"
        },
        {
            batchNumber: "COG99A99",
            quantity: 1650,
            expiry: "2024/08/31"
        }
    ]
}

const fillBatchDetails = function(batchesObj){
    return Object.keys(batchesObj).reduce((accum, gtin) => {
        accum[gtin] = batchesObj[gtin].map(b => new Batch(Object.assign({}, b, {
            serialNumbers: Array.from((new Array(b.quantity)).keys()).map((_) => generateGtin()),
            batchStatus: BatchStatus.COMMISSIONED
        })));
        return accum;
    }, {})
}

const getMSDBatches = function(){
    return fillBatchDetails(MSD_BATCHES);
}

const getPfizerBatches = function(){
    return fillBatchDetails(PFIZER_BATCHES);
}

const getRocheBatches = function(){
    return fillBatchDetails(ROCHE_BATCHES);
}

const getBayerBatches = function(){
    return fillBatchDetails(BAYER_BATCHES);
}

const getNovoNordiskBatches = function(){
    return fillBatchDetails(NOVO_NORDISK_BATCHES);
}

const getGskBatches = function(){
    return fillBatchDetails(GSK_BATCHES);
}

const getTakedaBatches = function(){
    return fillBatchDetails(TAKEDA_BATCHES);
}

const getSanofiBatches = function(){
    return fillBatchDetails(SANOFI_BATCHES);
}

const DFM_BATCHES1 = {
    '02113100000028': [ // Alpidrin
        {
            batchNumber: "ALPV1",
            quantity: 20,
            expiry: "2030/12/31",
            serialNumbers: [
                '93342708522623', '57142948840311', '84658726199147',
                '37492904539888', '96562748897283', '54264257431848',
                '03030164326594', '34366933576258', '26539110197947',
                '95038364859689', '03690127622893', '75101018014992',
                '01940652032034', '33116805950363', '32559689814488',
                '62282353911016', '78477001947639', '48457736116806',
                '94752993902481', '77150980360804'
            ]
        }
    ],
    '07613421039424': [ // TrueMedin
        {
            batchNumber: "LC4062",
            quantity: 1,
            expiry: "2030/12/31",
            serialNumbers: [
                '93342708522623'
            ]
        }
    ],
    '37482919347386': [ // INCMedin
        {
            batchNumber: "WB5208",
            quantity: 1,
            expiry: "2030/12/31",
            serialNumbers: [
                'VQ8911LQ7'
            ]
        },
        {
            batchNumber: "DN9968",
            quantity: 1,
            expiry: "2030/12/31",
            serialNumbers: [
                'XF5849GM0'
            ]
        },
        {
            batchNumber: "EF5673",
            quantity: 1,
            expiry: "2030/12/31",
            serialNumbers: [
                'YP4881JB3'
            ]
        },
        {
            batchNumber: "VU0173",
            quantity: 1,
            expiry: "2030/12/31",
            serialNumbers: [
                'ZJ1459SC1'
            ]
        },
        {
            batchNumber: "WO6983",
            quantity: 1,
            expiry: "2030/12/31",
            serialNumbers: [
                'ZZ2579CI6'
            ]
        },
        {
            batchNumber: "LM8225",
            quantity: 1,
            expiry: "2030/12/31",
            serialNumbers: [
                'VL3768BL1'
            ]
        },
        {
            batchNumber: "DY3250",
            quantity: 1,
            expiry: "2030/12/31",
            serialNumbers: [
                'WI5073RN7'
            ]
        },
        {
            batchNumber: "AD4707",
            quantity: 1,
            expiry: "2030/12/31",
            serialNumbers: [
                'XU0212RQ3'
            ]
        },
        {
            batchNumber: "SU9047",
            quantity: 1,
            expiry: "2030/12/31",
            serialNumbers: [
                'ZH5397LK8'
            ]
        },
        {
            batchNumber: "YF9028",
            quantity: 1,
            expiry: "2030/12/31",
            serialNumbers: [
                'ZT7301DW7'
            ]
        }
    ]
}

const getDfmBatches1ForGtin = function(gtin){
    const dfmBatches1 = DFM_BATCHES1[gtin];
    //console.log(dfmBatches1);
    return dfmBatches1;
}

module.exports = {
    getMSDBatches,
    getPfizerBatches,
    getRocheBatches,
    getBayerBatches,
    getNovoNordiskBatches,
    getGskBatches,
    getTakedaBatches,
    getSanofiBatches,
    getDfmBatches1ForGtin
}
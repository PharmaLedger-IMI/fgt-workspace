
const Batch = require('../../../fgt-dsu-wizard/model/Batch');
const BatchStatus = require('../../../fgt-dsu-wizard/model/BatchStatus')
const {generateGtin} = require('../utils')

const MSD_BATCHES = {
    "00366582505358": [
        {
            batchNumber: "R034995",
            quantity: 3542,
            expiry: "2021/08/31"
        },
        {
            batchNumber: "S002961",
            quantity: 2692,
            expiry: "2021/10/31"
        },
        {
            batchNumber: "S006749",
            quantity: 4042,
            expiry: "2021/11/31"
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
            expiry: "2022/10/31"
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

module.exports = {
    getMSDBatches,
    getPfizerBatches,
    getRocheBatches
}
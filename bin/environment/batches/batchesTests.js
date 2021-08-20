
const Batch = require('../../../fgt-dsu-wizard/model/Batch');
const BatchStatus = require('../../../fgt-dsu-wizard/model/BatchStatus')
const {generateGtin} = require('../utils')

const MSD_BATCHES = {
    "00366582505358": [
        {
            batchNumber: "R034995",
            quantity: 3542,
            expiry: "31/08/2021"
        },
        {
            batchNumber: "S002961",
            quantity: 2692,
            expiry: "31/10/2021"
        },
        {
            batchNumber: "S006749",
            quantity: 4042,
            expiry: "31/11/2021"
        }
    ],
    "00191778005295": [
        {
            batchNumber: "U002114",
            quantity: 44776,
            expiry: "31/08/2023"
        },
        {
            batchNumber: "U008604",
            quantity: 46070,
            expiry: "31/10/2023"
        }
    ],
    "00191778020380": [
        {
            batchNumber: "U002872",
            quantity: 11167,
            expiry: "31/07/2023"
        },
        {
            batchNumber: "U011610",
            quantity: 8205,
            expiry: "31/10/2023"
        },
        {
            batchNumber: "U018760",
            quantity: 12694,
            expiry: "30/11/2023"
        }
    ],
    "00191778001693": [
        {
            batchNumber: "T039771",
            quantity: 153816,
            expiry: "31/07/2023"
        },
        {
            batchNumber: "U011389",
            quantity: 162355,
            expiry: "31/10/2023"
        }
    ]
}

const PFIZER_BATCHES = {
    "08470007909231": [
        {
            batchNumber: "DIF1",
            quantity: 5000,
            expiry: "01/01/2023"
        },
        {
            batchNumber: "DIF2",
            quantity: 3000,
            expiry: "01/05/2023"
        },
        {
            batchNumber: "DIF3",
            quantity: 1500,
            expiry: "01/07/2023"
        },
        {
            batchNumber: "DIF4",
            quantity: 8000,
            expiry: "01/09/2023"
        },
        {
            batchNumber: "DIF5",
            quantity: 4500,
            expiry: "01/01/2024"
        }
    ],
    "05415062336861": [
        {
            batchNumber: "DP1",
            quantity: 200,
            expiry: "01/01/2023"
        },
        {
            batchNumber: "DP2",
            quantity: 600,
            expiry: "01/05/2023"

        },
        {
            batchNumber: "DP3",
            quantity: 1000,
            expiry: "01/07/2023"
        },
        {
            batchNumber: "DP4",
            quantity: 300,
            expiry: "01/09/2023"
        },
        {
            batchNumber: "DP5",
            quantity: 2000,
            expiry: "01/01/2024"
        }
    ]
}

const fillBatchDetails = function(batchesObj){
    return Object.keys(batchesObj).reduce((accum, gtin) => {
        accum[gtin] = batchesObj[gtin].map(b => new Batch(Object.assign(b, {
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

module.exports = {
    getMSDBatches,
    getPfizerBatches
}
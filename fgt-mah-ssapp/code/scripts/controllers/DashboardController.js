import {LocalizedController, HistoryNavigator, EVENT_REFRESH,} from "../../assets/pdm-web-components/index.esm.js";

export default class DashboardController extends LocalizedController {

    initializeModel = () => ({
        saleChartData: '',
        saleChartOptions: '',
        stockChartData: '',
        stockChartOptions: '',
        shipmentChartData: '',
        shipmentChartOptions: '',
        shipmentsChartTable: ''
    });

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, "dashboard");
        this.model = this.initializeModel();
        HistoryNavigator.registerTab({
            'tab-dashboard': this.translate('title')
        })

        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        this.issuedShipmentManager = wizard.Managers.getIssuedShipmentManager(participantManager);
        this.receivedShipmentManager = wizard.Managers.getReceivedShipmentManager(participantManager);
        this.issuedShipmentManager.bindController(this);
        this.receivedShipmentManager.bindController(this);
        this.stockManager = wizard.Managers.getStockManager(participantManager);

        const self = this;
        self.updateSaleChart({
            labels: ["Diflucan", "Depo Medrol", "Ventolin", "Benlysta", "Fiasp", "Novolin", "Adalat"],
            total: [86,114,106,106,107,111,133],
            mahToWhs: [70,90,44,60,83,90,100],
            whsToPha: [10,21,60,44,17,21,17],
            phaToFinalUser: [6,3,2,2,7,0,16]
        })

        self.updateStockChart({
            labels: ["Diflucan", "Depo Medrol", "Ventolin", "Benlysta", "Fiasp", "Novolin", "Adalat"],
            monthlyAvg: [1091, 2662, 1650, 3144, 3721, 3160, 3775],
            productsInStock: [1591, 1962, 2150, 2844, 3521, 3660, 4175]
        })

        self.updateShipmentsChart({
            labels: ["Created", "on Hold", "for Pickup", "in Transit", "Delivered", "Pending Conf.","Recall"],
            shipmentsQtyByStatus: [1251, 2561, 958, 3690, 1305, 2391, 105]
        })

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();

            // update stock chart
            this.stockManager.getAll(true, (err, stock) => {
                if(err)
                    console.error(err)
                const stockManagement = stock.reduce((accum, product) => {
                    accum[product.name] = product.quantity
                    return accum;
                }, {})
                const sortStockManagement = Object.entries(stockManagement)
                    .sort(([,a],[,b]) => a-b)
                    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

                self.updateStockChart({
                    labels: Object.keys(sortStockManagement),
                    monthlyAvg: Object.values(sortStockManagement).map(v => (Math.random() + 0.5) * v),
                    productsInStock: Object.values(sortStockManagement)
                })
            })

            // update shipment chart
            self.issuedShipmentManager.getAll(true, (err, issuedShipments) => {
                if (err)
                    return console.error(err)

                const statusDictionary = {
                    created: 'Created',
                    hold: 'on Hold',
                    pickup: 'for Pickup',
                    transit: 'in Transit',
                    delivered: 'Delivered',
                    received: 'Pending Conf.',
                    recall: 'Recall'
                }
                const shipmentsChartTable = []
                // initialize with zero for each status
                const shipments = Object.values(statusDictionary).reduce((acc, statusValue) => {
                    acc[statusValue] = 0;
                    return acc
                }, {})
                const shipmentsQtyByStatus = issuedShipments.reduce((accum, curr) => {
                    // if confirmed, the order has been completed
                    if (curr.status.status !== 'confirmed') {
                        const statusLabel = statusDictionary[curr.status.status]

                        const timestampDiffFromNow = (timestamp) => {
                            let delta = (Date.now() - timestamp) / 1000; // delta and transform to seconds
                            const days = Math.floor(delta / 86400); // 24*60*60 - seconds -> days
                            delta -= (days * 86400);
                            const hours = Math.floor(delta / 3600) % 24;
                            delta -= (hours * 3600);
                            const min = Math.floor(delta / 60) % 60;
                            return (days > 0 ? `${days}d` : '') + (hours > 0 ? `${hours}h` : '') + (min > 0 ? `${min}m` : '');
                        }

                        const lastUpdate = curr.status.log[curr.status.log.length - 1]; // in timestamp
                        shipmentsChartTable.push({
                            shipmentId: curr.shipmentId,
                            requesterId: curr.requesterId,
                            status: statusLabel,
                            days: timestampDiffFromNow(lastUpdate.split(' ')[1].trim())
                        })
                        accum[statusLabel] += 1; // add +1 shipment qty
                    }
                    return accum;
                }, shipments)

                console.log('$$$ issuedShipments=', issuedShipments)
                console.log('$$$ shipmentsQtyByStatus=', shipmentsQtyByStatus)
                console.log('$$$ shipmentsChartTable=', shipmentsChartTable)

                this.updateShipmentsChart({
                    labels: Object.keys(shipmentsQtyByStatus),
                    shipmentsQtyByStatus: Object.values(shipmentsQtyByStatus)
                })
                self.model.shipmentsChartTable = JSON.stringify(shipmentsChartTable)
            })

        }, {capture: true});
        console.log('DashboardController Initialized');
    }

    updateSaleChart(metadata, options) {
        const gData = {
            labels: metadata.labels,
            datasets: [{
                data: metadata.total,
                label: "Total",
                borderColor: "#001219",
                backgroundColor: "#001219",
                borderWidth:2,
                type: 'line',
                fill:false
            }, {
                data: metadata.mahToWhs,
                label: "MAH -> WHS",
                backgroundColor: "#005f73",
            }, {
                data: metadata.whsToPha, //[10,21,60,44,17,21,17],
                label: "WHS -> PHA",
                backgroundColor:"#0a9396",
            }, {
                data: metadata.phaToFinalUser, // [6,3,2,2,7,0,16],
                label: "PHA -> USER",
                backgroundColor:"#94d2bd",
            }]
        }
        options = {
            plugins: {
                title: { display: false },
                legend: { position: 'bottom'}
            },
            ...options
        }
        this.buildChart('saleChart', gData, options)
    }

    updateStockChart(metadata, options) {
        const gData =  {
            labels: metadata.labels,
            datasets: [
                {
                    label: "Overall Monthly Average",
                    data: metadata.monthlyAvg,
                    borderColor: "#001219",
                    backgroundColor: "#001219",
                    borderWidth:2,
                    type: 'line',
                    fill:false
                },
                {
                    label: "Products in Stock",
                    backgroundColor: ["#76c893", "#52b69a","#34a0a4","#168aad","#1a759f", "#1e6091", "#184e77"],
                    data: metadata.productsInStock
                }
            ]
        }
        options = {
            plugins: {
                title: { display: false },
                legend: false
            },
            ...options
        }
        this.buildChart('stockChart', gData, options)
    }

    updateShipmentsChart(metadata, options) {
        const gData =  {
            labels: metadata.labels,
            datasets: [
                {
                    label: "Total Shipments",
                    backgroundColor: ["#02C39A", "#F6AE2D","#2F4858","#219EBC","#8ECAE6", "#E4959E", "#FA003F"],
                    data: metadata.shipmentsQtyByStatus
                }
            ]
        }
        options = {
            title: { display: true },
            plugins: { legend: false },
            indexAxis: 'y',
            ...options
        }
        this.buildChart('shipmentChart', gData, options)
    }

    buildChart(name, data, options) {
        if (data) {
            this.model[`${name}Data`] = JSON.stringify(data);
        }
        if (options) {
            this.model[`${name}Options`] = JSON.stringify(options);
        }
    }
}
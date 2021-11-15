import {LocalizedController, HistoryNavigator, EVENT_REFRESH,} from "../../assets/pdm-web-components/index.esm.js";

export default class DashboardController extends LocalizedController {

    initializeModel = () => ({});

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
        self.buildChart('sold', {
            labels: ["Diflucan", "Depo Medrol", "Ventolin", "Benlysta", "Fiasp", "Novolin", "Adalat"],
            datasets: [{
                data: [86,114,106,106,107,111,133],
                label: "Total",
                borderColor: "#001219",
                backgroundColor: "#001219",
                borderWidth:2,
                type: 'line',
                fill:false
            }, {
                data: [70,90,44,60,83,90,100],
                label: "MAH -> WHS",
                backgroundColor: "#005f73",
            }, {
                data: [10,21,60,44,17,21,17],
                label: "WHS -> PHA",
                backgroundColor:"#0a9396",
            }, {
                data: [6,3,2,2,7,0,16],
                label: "PHA -> USER",
                backgroundColor:"#94d2bd",
            }]
        }, {
            plugins: {
                title: {
                    display: false,
                    text: 'Most Sold Products',
                    font: {
                        size: 18
                    }
                },
                legend: {
                    position: 'bottom'
                }
            }
        })
        self.buildChart('stock', {
            labels: ["Diflucan", "Depo Medrol", "Ventolin", "Benlysta", "Fiasp", "Novolin", "Adalat"],
            datasets: [
                {
                    label: "Overall Monthly Average",
                    data: [1091, 2662, 1650, 3144, 3721, 3160, 3775],
                    borderColor: "#001219",
                    backgroundColor: "#001219",
                    borderWidth:2,
                    type: 'line',
                    fill:false
                },
                {
                    label: "Products in Stock",
                    backgroundColor: ["#76c893", "#52b69a","#34a0a4","#168aad","#1a759f", "#1e6091", "#184e77"],
                    data: [1591, 1962, 2150, 2844, 3521, 3660, 4175]
                }
            ]
        }, {
            plugins: {
                title: {
                    display: false,
                    text: 'Most Stock Products',
                    font: {
                        size: 18
                    }
                },
                legend: false
            }
        })
        self.buildChart('shipments', {
            labels: ["Created", "on Hold", "for Pickup", "in Transit", "Delivered", "Pending Conf.","Recall"],
            datasets: [
                {
                    label: "Total Orders",
                    backgroundColor: ["#02C39A", "#F6AE2D","#2F4858","#219EBC","#8ECAE6", "#E4959E", "#FA003F"],
                    data: [1251, 2561, 958, 3690, 1305, 2391, 105]
                }
            ]
        }, {
            indexAxis: 'y',
            plugins: {
                legend: false,
            },
            title: {
                display: true
            }
        })

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            this.stockManager.getAll(true, (err, stock) => {
                if (err)
                    return console.log('$$', err)
                const stockManagement = stock.reduce((accum, product) => {
                    accum[product.name] = product.quantity
                    return accum;
                }, {})
                self.buildChart('stock', {
                    labels: Object.keys(stockManagement), //["Diflucan", "Depo Medrol", "Ventolin", "Benlysta", "Fiasp", "Novolin", "Adalat"],
                    datasets: [
                        {
                            label: "Overall Monthly Average",
                            data: Object.values(stockManagement).map(v => (Math.random() + 0.5) * v), //[1091, 2662, 1650, 3144, 3721, 3160, 3775],
                            borderColor: "#001219",
                            backgroundColor: "#001219",
                            borderWidth:2,
                            type: 'line',
                            fill:false
                        },
                        {
                            label: "Products in Stock",
                            backgroundColor: ["#76c893", "#52b69a","#34a0a4","#168aad","#1a759f", "#1e6091", "#184e77"],
                            data: Object.values(stockManagement)
                        }
                    ]
                })
                self.model.stockData = JSON.stringify({
                    labels: Object.keys(stockManagement), //["Diflucan", "Depo Medrol", "Ventolin", "Benlysta", "Fiasp", "Novolin", "Adalat"],
                    datasets: [
                        {
                            label: "Overall Monthly Average",
                            data: Object.values(stockManagement).map(v => (Math.random() + 0.5) * v), //[1091, 2662, 1650, 3144, 3721, 3160, 3775],
                            borderColor: "#001219",
                            backgroundColor: "#001219",
                            borderWidth:2,
                            type: 'line',
                            fill:false
                        },
                        {
                            label: "Products in Stock",
                            backgroundColor: ["#76c893", "#52b69a","#34a0a4","#168aad","#1a759f", "#1e6091", "#184e77"],
                            data: Object.values(stockManagement)
                        }
                    ]
                });
                console.log('$$ stock.stockManagement=', stockManagement);

                /**
                 self.stockManager.getStockTraceability("MAH135315170", "08470007909231", "DIF1", async (err, stockTrace) => {
                    if (err)
                        return console.log('$$', err)
                    console.log('$$ stock.stockTrace=', stockTrace)
                })
                 */

                const shipmentsTable = []
                const statuses = {
                    created: 'Created',
                    hold: 'on Hold',
                    pickup: 'for Pickup',
                    transit: 'in Transit',
                    delivered: 'Delivered',
                    received: 'Pending Conf.',
                    recall: 'Recall'
                }
                const shipments = Object.values(statuses).reduce((acc, curr) => {
                    acc[curr] = 0
                    return acc
                }, {})
                // {created: 0, hold: 0, pickup: 0, transit: 0, delivered: 0, pendingConf: 0, recall: 0}
                self.issuedShipmentManager.getAll(true, (err, issuedShipments) => {
                    if (err)
                        return console.log('$$', err)
                    const acc = issuedShipments.reduce((accum, curr) => {
                        if (curr.status.status !== 'confirmed') {
                            const key = statuses[curr.status.status]
                            accum[key] += 1;
                            const dt = curr.status.log[curr.status.log.length - 1]
                            const data = {
                                shipmentId: curr.shipmentId,
                                requesterId: curr.requesterId,
                                status: key,
                                days: ((Date.now() - dt.split(' ')[1].trim()) / (24*60*60*1000)).toFixed(1) + 'd'// 1 day in milliseconds
                            }
                            shipmentsTable.push(data)
                        }
                        return accum;
                    }, shipments);

                    self.buildChart('shipments', {
                        labels: Object.keys(shipments), //["Created", "on Hold", "for Pickup", "in Transit", "Delivered", "Pending Conf.","Recall"],
                        datasets: [
                            {
                                label: "Total Shipments",
                                backgroundColor: ["#02C39A", "#F6AE2D","#2F4858","#219EBC","#8ECAE6", "#E4959E", "#FA003F"],
                                data: Object.values(shipments)
                            }
                        ]
                    })
                    self.model.shipmentsTable = JSON.stringify(shipmentsTable)

                    console.log('$$ issuedShipments=', issuedShipments)
                    console.log('$$ shipments=', acc)
                    console.log('$$ shipmentsTable=', shipmentsTable)
                })

                console.log('$$ model=', self.model)
            })

        }, {capture: true});
        console.log('DashboardController Initialized');
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
import {LocalizedController, HistoryNavigator, EVENT_REFRESH,} from "../../assets/pdm-web-components/index.esm.js";

export default class DashboardController extends LocalizedController {

    initializeModel = () => ({
        saleChartData: '',
        saleChartOptions: '',
        stockChartData: '',
        stockChartOptions: '',
        shipmentChartData: '',
        shipmentChartOptions: '',
        shipmentsTableStruct: JSON.stringify([
            {id: 'shipmentId', label: '#', props: {size: '3'}},
            {id: 'requesterId', label: 'Requester', props: {size: '4'}},
            {id: 'status', label: 'Status', props: {size: '3'}},
            {id: 'days', label: 'Last Update', props: {size: '2'}},
        ]),
        lastUpdate: new Date().toLocaleString()
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
        this.stockManager = wizard.Managers.getStockManager(participantManager);

        const self = this;
        self.updateAllCharts();

        self.onTagEvent('update-dashboard', 'click', () => {
            self.updateAllCharts();
        });
        console.log('DashboardController Initialized');
    }

    updateAllCharts() {
        const self = this;
        self.model.lastUpdate = new Date().toLocaleString()
        // update sale chart
        this.stockManager.getAll(true, async (err, products) => {
            if(err)
                console.error(err)

            let index = 0;
            products.reduce((accum, product) => {
                const {gtin, name} = product;
                accum[name] = {x: name, gtin: gtin, mah: 0, whs: 0, pha: 0, total: 0};
                self.stockManager.getStockTraceability(gtin, {manufName: "MAH135315170"}, (err, stockTrace) => {
                    const {partnersStock} = stockTrace;
                    Object.keys(partnersStock).map(key => {
                        const value = partnersStock[key];
                        if (key.startsWith('PHA')) {
                            accum[name].pha += value.dispatched
                        } else if (key.startsWith('WHS')) {
                            accum[name].mah += (value.inStock + value.dispatched)
                            accum[name].whs += value.dispatched
                        }
                    })
                    accum[name].total = accum[name].mah + accum[name].whs + accum[name].pha;
                    index += 1
                    if (index === products.length)
                        this.updateSaleChart({data: Object.values(accum)})
                })
                return accum;
            }, {})
        })

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

            this.updateShipmentsChart({
                labels: Object.keys(shipmentsQtyByStatus),
                shipmentsQtyByStatus: Object.values(shipmentsQtyByStatus)
            })
            self.model.shipmentsChartTable = JSON.stringify(shipmentsChartTable)
        })

    }

    updateSaleChart(metadata, options) {
        const labels = []
        const sortedAndFiltered = metadata.data.sort((a, b) => {
            if (a.total < b.total) return -1;
            if (a.total > b.total ) return 1;
            return 0;
        }).filter((v) => {
            if (v.total > 0)  {
                labels.push(v.x)
                return v.total > 0;
            }
        })

        const gData = {
            labels: labels,
            datasets: [
                {
                    data: sortedAndFiltered,
                    label: "Total",
                    borderColor: "#001219",
                    backgroundColor: "#001219",
                    borderWidth:2,
                    type: 'line',
                    fill:false,
                    parsing: {
                        yAxisKey: 'total'
                    }
                },
                {
                    label: 'MAH',
                    data: sortedAndFiltered,
                    backgroundColor: "#005f73",
                    parsing: {
                        yAxisKey: 'mah'
                    }
                },
                {
                    label: 'WHS',
                    data: sortedAndFiltered,
                    backgroundColor:"#0a9396",
                    parsing: {
                        yAxisKey: 'whs'
                    }
                },
                {
                    label: 'PHA',
                    data: sortedAndFiltered,
                    backgroundColor:"#94d2bd",
                    parsing: {
                        yAxisKey: 'pha'
                    }
                }]
        }
        options = {...options}
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
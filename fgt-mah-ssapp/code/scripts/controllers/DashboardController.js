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

        // update sale and stock chart
        self.stockManager.getAll(true, (err, stock) => {
            if(err)
                return console.error(err)
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

            // # sale chart
            const stockIterator = (accum, products, _callback) => {
                const product = products.shift();
                if (!product)
                    return _callback(undefined, {...accum});

                const {gtin, name} = product;
                accum[name] = {x: name, gtin: gtin, mah: 0, whs: 0, pha: 0, total: 0};
                self.stockManager.getStockTraceability(gtin, (err, stockTrace) => {
                    if (err)
                        return console.error(err);
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
                    stockIterator(accum, products, _callback)
                })
            }

            stockIterator({}, stock.slice(), (err, res) => {
                if (err)
                    return console.error(err);
                this.updateSaleChart({data: Object.values(res)})
                // update shipment chart
                self.issuedShipmentManager.getAll(true, (err, issuedShipments) => {
                    if (err)
                        return console.error(err)

                    const shipmentsChartTable = []
                    // initialize with zero for each status
                    const shipmentsInitialQty = Object.values(self.model.allowedShipmentStatuses).reduce((acc, statusValue) => {
                        acc[statusValue] = 0;
                        return acc
                    }, {})
                    const shipmentsQtyByStatus = issuedShipments.reduce((accum, curr) => {
                        // status confirmed is not in dictionary, because in this case, the order/shipment has been completed
                        if (self.model.allowedShipmentStatuses.hasOwnProperty(curr.status.status)) {
                            const statusLabel = self.model.allowedShipmentStatuses[curr.status.status]

                            const timestampDiffFromNow = (timestamp) => {
                                let delta = (Date.now() - timestamp) / 1000; // delta and transform to seconds
                                const days = Math.floor(delta / 86400); // 24*60*60 - seconds -> days
                                delta -= (days * 86400);
                                const hours = Math.floor(delta / 3600) % 24;
                                delta -= (hours * 3600);
                                const min = Math.floor(delta / 60) % 60;
                                return (days > 0 ? `${days}d` : '') + (hours > 0 ? `${hours}h` : '') + (min > 0 ? `${min}m` : '') || 'now';
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
                    }, shipmentsInitialQty)

                    this.updateShipmentsChart({
                        labels: Object.keys(shipmentsQtyByStatus),
                        shipmentsQtyByStatus: Object.values(shipmentsQtyByStatus)
                    })
                    self.model.shipmentsChartTable = JSON.stringify(shipmentsChartTable)
                })
            })
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
                    },
                }
            ]
        }
        options = {
            plugins: {legend: { position: 'bottom'}},
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
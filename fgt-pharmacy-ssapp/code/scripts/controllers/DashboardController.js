import { LocalizedController, HistoryNavigator } from "../../assets/pdm-web-components/index.esm.js";

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
        this.receivedShipmentManager = wizard.Managers.getReceivedShipmentManager(participantManager);
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
        self.model.lastUpdate = new Date().toLocaleString();
        const cacheProductName = {};
        const registerProductName = (gtin, name) => { cacheProductName[gtin] = name };
        const saleCalculator = (saleObj, productName, qty) => {
            const sale = saleObj[productName] ? saleObj[productName] : {x: productName, qty: 0}
            return { x: sale.x, qty: sale.qty + qty }
        }

        // update stock chart
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
        })

        // update sale &  shipment chart
        self.receivedShipmentManager.getAll(true, (err, receivedShipments) => {
            if (err)
                return console.error(err)

            const shipmentLines = receivedShipments.reduce((accum, issuedShipment) => {
                return [...accum, ...issuedShipment.shipmentLines];
            }, [])

            // # update sale chart
            const saleAccountant = (accum, shipmentLines, _callback) => {
                const shipmentLine = shipmentLines.shift();
                if (!shipmentLine)
                    return _callback(undefined, accum)
                if (shipmentLine.status !== 'confirmed') {
                    const { gtin } = shipmentLine;
                    if (!cacheProductName.hasOwnProperty(gtin)) {
                        self.stockManager.getOne(gtin, (err, product) => {
                            registerProductName(gtin, product.name);
                            accum[product.name] = saleCalculator(accum, product.name, shipmentLine.quantity)
                            saleAccountant(accum, shipmentLines, _callback)
                        })
                    } else {
                        const productName = cacheProductName[gtin]
                        accum[productName] = saleCalculator(accum, productName, shipmentLine.quantity)
                    }
                    saleAccountant(accum, shipmentLines, _callback)
                }
            }

            saleAccountant({}, shipmentLines.slice(), (err, res) => {
                if (err)
                    return console.error(err)
                self.updateSaleChart({data: Object.values(res)})
            })

            // # update shipments chart
            const shipmentsChartTable = []
            // initialize with zero for each status
            const shipmentsInitialQty = Object.values(self.model.allowedShipmentStatuses).reduce((acc, statusValue) => {
                acc[statusValue] = 0;
                return acc
            }, {})
            const shipmentsQtyByStatus = receivedShipments.reduce((accum, curr) => {
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

    }

    updateSaleChart(metadata, options) {
        const labels = []
        const sortedAndFiltered = metadata.data.sort((a, b) => {
            if (a.qty < b.qty) return -1;
            if (a.qty > b.qty ) return 1;
            return 0;
        }).filter((v) => {
            if (v.qty > 0)  {
                labels.push(v.x)
                return v.qty > 0;
            }
        })

        const gData = {
            labels: labels,
            datasets: [
                {
                    label: 'Qty',
                    data: sortedAndFiltered,
                    backgroundColor: "#005f73",
                    parsing: {
                        yAxisKey: 'qty'
                    }
                }
            ]
        }
        options = {
            plugins: {legend: false},
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
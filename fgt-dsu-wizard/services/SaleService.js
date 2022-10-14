const utils = require('../../pdm-dsu-toolkit/services/utils');

const {STATUS_MOUNT_PATH, INFO_PATH} = require('../constants');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function ReceiptService
 * @memberOf Services
 */
function SaleService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const {Sale} = require('../model');
    const endpoint = 'receipt';

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    const BRICKS_DOMAIN_KEY = require("opendsu").constants.BRICKS_DOMAIN_KEY
    let keyGenFunction = require('../commands/setSaleSSI').createSaleSSI;

    const getBricksDomainFromProcess = function(){
        if (!globalThis.process || !globalThis.process["BRICKS_DOMAIN"])
            return undefined;
        return globalThis.process["BRICKS_DOMAIN"];
    }

    /**
     * Resolves the DSU and loads the OrderLine object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err?, OrderLine?)} callback
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                let sale;
                try{
                    sale = new Sale(JSON.parse(data));
                } catch (e){
                    return callback(`Could not parse ShipmentLine in DSU ${keySSI}`);
                }

                callback(undefined, sale);
            });
        });
    }

    this.generateKey = function(sale, bricksDomain){
        let keyGenFunction = require('../commands/setSaleSSI').createSaleSSI;
        let keyGenData = {
            data: [
                sale.id,
                sale.sellerId
            ]
        }
        if (bricksDomain)
            keyGenData[BRICKS_DOMAIN_KEY] = bricksDomain
        return keyGenFunction(keyGenData, domain);
    }

    /**
     * Creates an orderLine DSU
     * @param {string | Sale} sale
     * @param {KeySSI} statusSSI the keySSI for the OrderStus DSU
     * @param {function(err?, KeySSI?, Archive?)} callback
     */
    this.create = function(sale, callback){

        const errors = sale.validate(true);

        if (errors)
            return callback(errors);

        let data = typeof sale == 'object' ? JSON.stringify(sale) : sale;

        if (isSimple){
            let keySSI = this.generateKey(sale, getBricksDomainFromProcess())
            utils.selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);

                const cb = function(err, ...results){
                    if (err)
                        return dsu.cancelBatch(err2 => {
                            callback(err);
                        });
                    callback(undefined, ...results);
                }

                try {
                    dsu.beginBatch();
                } catch (e) {
                    return callback(e);
                }

                dsu.writeFile(INFO_PATH, data, (err) => {
                    if (err)
                        return cb(err);
                    dsu.commitBatch((err) => {
                        if (err)
                            return cb(err);
                        dsu.getKeySSIAsObject(callback);
                    });
                });
            })
        } else {
            let getEndpointData = function (sale){
                return {
                    endpoint: endpoint,
                    data: [
                        sale.id,
                        sale.sellerId
                    ]
                }
            }

            utils.getDSUService().create(domain, getEndpointData(sale), (builder, cb) => {
                builder.addFileDataToDossier(INFO_PATH, data, cb);
            }, callback);
        }
    };
}

module.exports = SaleService;
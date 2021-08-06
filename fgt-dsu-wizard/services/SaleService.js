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

        let keyGenData = {
            data: [
                sale.id,
                sale.senderId,
                sale.manufName
            ]
        }

        if (isSimple){
            let keyGenFunction = require('../commands/setSaleSSI').createSaleSSI;
            let keySSI = keyGenFunction(keyGenData, domain);
            utils.selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);
                dsu.writeFile(INFO_PATH, data, (err) => {
                    if (err)
                        return callback(err);
                    dsu.getKeySSIAsObject((err, keySSI) => {
                        if (err)
                            return callback(err);
                        callback(undefined, keySSI);
                    });
                });
            })
        } else {
            let getEndpointData = function (sale){
                return {
                    endpoint: endpoint,
                    data: [
                        sale.id,
                        sale.senderId,
                        sale.manufName
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
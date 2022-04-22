const utils = require('../../pdm-dsu-toolkit/services/utils');
const ModelUtils = require('../model/utils');
const {STATUS_MOUNT_PATH, INFO_PATH} = require('../constants');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function BatchService
 * @memberOf Services
 */
function BatchService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const Batch = require('../model').Batch;
    const endpoint = 'batch';
    const keyGenFunction = require('../commands/setBatchSSI').createBatchSSI;
    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);
    const statusService = new (require('./StatusService'))(domain, strategy);
    const productService = new ( require('./ProductService'))(domain, strategy);

    this.generateKey = function(gtin, batchNumber){
        let keyGenData = {
            gtin: gtin,
            batch: batchNumber
        }
        return keyGenFunction(keyGenData, domain);
    }

    this.getDeterministic = function(gtin, batchNumber, callback){
        const key = this.generateKey(gtin, batchNumber);
        this.get(key, callback);
    }
    
    const validateUpdate = function(batchFromSSI, updatedBatch, callback){
        if (!ModelUtils.isEqual(batchFromSSI, updatedBatch, "batchStatus"))
            return callback('invalid update');
        return callback();
    }

    let createBatchStatus = function (id, status, callback) {
        if (typeof status === 'function') {
            callback = status;
            status = id;
            id = undefined;
        }
        statusService.create(status, id, (err, keySSI) => {
            if (err)
                return callback(err);
            console.log(`BatchStatus DSU created with SSI ${keySSI.getIdentifier(true)}`);
            callback(undefined, keySSI);
        });
    }

    /**
     * Resolves the DSU and loads the Batch object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err, Order)} callback
     * @memberOf BatchService
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                let batch;
                try{
                    batch = new Batch(JSON.parse(data));
                } catch (e) {
                    return callback(`unable to parse Batch: ${data}`);
                }

                utils.getMounts(dsu, '/', STATUS_MOUNT_PATH, (err, mounts) => {
                    if(err)
                        return callback(err);
                    
                    statusService.get(mounts[STATUS_MOUNT_PATH], (err, status) => {
                        if(err)
                            return callback(err);

                        batch.batchStatus = status;    

                        callback(undefined, batch, dsu);
                    });
                });
            });
        });
    }

    /**
     * Creates a {@link Batch} DSU
     * @param {string} gtin
     * @param {Batch} batch
     * @param {function(err, keySSI)} callback
     * @memberOf BatchService
     */
    this.create = function(gtin, batch, callback){

        let data = typeof batch === 'object' ? JSON.stringify(batch) : batch;
        batch = new Batch(batch);
        batch.batchStatus = BatchStatus.COMMISSIONED;
        const _err = batch.validate();
        if(_err)
            return callback(_err);

        if (isSimple){
            let keySSI = this.generateKey(gtin, batch.batchNumber);
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

                try{
                    dsu.beginBatch();
                }catch(e){
                    return callback(e);
                }

                dsu.writeFile(INFO_PATH, data, (err) => {
                    if (err)
                        return cb(err);
                    
                    productService.getDeterministic(gtin, (err, product) => {
                        if(err)
                            return callback(err);                        

                        createBatchStatus(product.manufName, batch.batchStatus, (err, statusSSI) =>{
                            if(err)
                                return cb(err);
                            
                            dsu.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(true), (err) => {
                                if(err)
                                    return cb(err);
                                    
                                dsu.commitBatch((err) => {
                                    if(err)
                                        return cb(err);
                                    dsu.getKeySSIAsObject(callback);
                                });
                            });
                        });
                    });
                });
            });
        } else {
            let getEndpointData = function (batch){
                return {
                    endpoint: endpoint,
                    data: {
                        gtin: gtin,
                        batch: batch.batchNumber
                    }
                }
            }

            utils.getDSUService().create(domain, getEndpointData(batch), (builder, cb) => {
                builder.addFileDataToDossier(INFO_PATH, data, cb);
            }, callback);
        }
    };


    /**
     * updates a product DSU
     * @param {string} gtin
     * @param {KeySSI} keySSI
     * @param {Batch} batch
     * @param {function(err?)} callback
     */
    this.update = function (gtin, keySSI, batch, callback) {
        // if batch is invalid, abort immediatly.
        const self = this;

        self.get(keySSI, (err, batchFromSSI, batchDsu) => {
            if(err)
                return callback(err);

            if(!(batch instanceof Batch))
                batch = new Batch(batch);
            err = batch.validate(batchFromSSI.batchStatus.status);
            if(err)
                return callback(err);

            const cb = function(err, ...results){
                if(err)
                    return batchDsu.cancelBatch(err2 => {
                        callback(err);
                    })
                callback(undefined, ...results);
            }

            try {
                batchDsu.beginBatch();
            } catch (e){
                return callback(e);
            }

            validateUpdate(batchFromSSI, batch, (err) =>{
                if(err)
                    return cb(err);
                
                utils.getMounts(batchDsu, '/', STATUS_MOUNT_PATH, (err, mounts) => {
                    if(err)
                        return cb(err);
                    
                    if(!mounts[STATUS_MOUNT_PATH])
                        return cb(`Missing mount path ${STATUS_MOUNT_PATH}`);

                    productService.getDeterministic(gtin, (err, product) => {
                        if(err)
                            return callback(err);
                        statusService.update(mounts[STATUS_MOUNT_PATH], batch.batchStatus, product.manufName, (err) => {
                            if (err)
                                return cb(err);

                            batchDsu.commitBatch((err) => {
                                if (err)
                                    return cb(err);

                                self.get(keySSI, callback);
                            });
                        });
                    });
                });
            });
        });
    }
}

module.exports = BatchService;
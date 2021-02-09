const utils = require("./utils.js");
//const scriptUtils = require('../utils.js');
const doPost = utils.getPostHandlerFor("dsu-wizard");

class DSUService {
    constructor() {
        let crypto = require("opendsu").loadApi("crypto");
        let http = require("opendsu").loadApi("http");

        // http.registerInterceptor((data, callback)=>{
        //     let {url, headers} = data;
        //     let scope = "";
        //
        //     if(typeof this.holderInfo != "undefined"){
        //         crypto.createPresentationToken(this.holderInfo.ssi, scope, this.credential, (err, presentationToken)=>{
        //             if(err){
        //                 return callback(err);
        //             }
        //
        //             headers["Authorization"] = presentationToken;
        //             return callback(undefined, {url, headers});
        //         });
        //     }else {
        //         console.log("Unexpected case");
        //         return callback(undefined, {url, headers});
        //     }
        //
        // });
    }

    // ensureHolderInfo(callback) {
    //     function getJSON(pth, callback){
    //         scriptUtils.fetch(pth).then((response) => {
    //             return response.json();
    //         }).then((json) => {
    //             return callback(undefined, json)
    //         }).catch(callback);
    //     }
    //
    //     if (typeof this.holderInfo === "undefined" || typeof this.credential === "undefined") {
    //         getJSON("/download/myKeys/holder.json", (err, holderInfo) => {
    //             if (err) {
    //                 return callback(Error("No holder info available!"));
    //             }
    //             this.holderInfo = holderInfo;
    //
    //             getJSON("/download/myKeys/credential.json", (err, result) => {
    //                 if (err) {
    //                     return callback(Error("No credentials available!"));
    //                 }
    //                 this.credential = result.credential;
    //                 return callback(undefined, holderInfo);
    //             });
    //         });
    //     } else {
    //         callback(undefined, this.holderInfo);
    //     }
    // }

    /**
     * Creates a DSU and initializes it via the provided initializer
     * @param {string} domain: the domain where the DSU is meant to be stored
     * @param {function} initializer: a method with arguments (dsuBuilder, callback)
     * <ul><li>the dsuBuilder provides the api to all operations on the DSU</li></ul>
     * @param {function} callback: the callback function
     * @return error, keySSI
     */
    create(domain, initializer, callback){
        this.getTransactionId(domain, (err, transactionId) => {
            if (err)
                return callback(err);
            initializer(this.bindToTransaction(domain, transactionId), err => {
                if (err)
                    return callback(err);
                callback(undefined);
            });
        });
    }

    /**
     * Creates a DSU and initializes it via the provided initializer
     * @param {string} domain: the domain where the DSU is meant to be stored
     * @param {keySSI} keySSI:
     * @param {function} modifier: a method with arguments (dsuBuilder, callback)
     * <ul><li>the dsuBuilder provides the api to all operations on the DSU</li></ul>
     * @param {function} callback: the callback function
     */
    update(domain, keySSI, modifier, callback){
        this.getTransactionId(domain, (err, transactionId) => {
           if (err)
               return callback(err);
           this.setKeySSI(transactionId, domain, keySSI, err =>{
               if (err)
                   return callback(err);
               modifier(this.bindToTransaction(domain, transactionId), err => {
                    if (err)
                        return callback(err);
                    callback();
               });
           });
        });
    }

    read(domain, keySSI, reader, callback){
        this.getTransactionId(domain, (err, transactionId) => {
            if (err)
                return callback(err);
            this.setKeySSI(transactionId, domain, keySSI, err =>{
                if (err)
                    return callback(err);
                reader(this.bindToTransaction(domain, transactionId), (err, data) => {
                    if (err)
                        return callback(err);
                    callback(undefined, data);
                });
            });
        });
    };

    bindToTransaction(domain, transactionId){
        let self = this;
        return new class {
            /**
             * @see {@link DSUService.setKeySSI} with already filled transactionId and domain
             */
            setKeySSI(keySSI, callback){
                self.setKeySSI(transactionId, domain, keySSI, callback);
            };
            /**
             * @see {@link DSUService.addFileDataToDossier} with already filled transactionId and domain
             */
            addFileDataToDossier(fileName, fileData, callback){
                self.addFileDataToDossier(transactionId, domain, fileName, fileData, callback);
            };
            /**
             * @see {@link DSUService.mount} with already filled transactionId and domain
             */
            mount(path, seed, callback){
                self.mount(transactionId, domain, path, seed, callback);
            };
            /**
             * @see {@link DSUService.buildDossier} with already filled transactionId and domain
             */
            buildDossier(callback){
                self.buildDossier(transactionId, domain, callback);
            };
        }
    }

    getTransactionId(domain, callback) {

        let obtainTransaction = ()=>{
            doPost(`/${domain}/begin`, (err, transactionId) => {
                if (err) {
                    return callback(err);
                }
                const url = `/${domain}/setDLDomain/${transactionId}`;
                doPost(url, domain, (err) => {
                    if (err) {
                        return callback(err);
                    }
                    return callback(undefined, transactionId);
                });
            });
        }

        // this.ensureHolderInfo( (err)=>{
        //     if(err){
        //         return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper("Holder missconfiguration in the wallet", err));
        //     }
            obtainTransaction();
        // });
    }

    setKeySSI(transactionId, domain, keyssi, callback) {
        const url = `/${domain}/setKeySSI/${transactionId}`;
        doPost(url, keyssi, callback);
    }
    //
    // setGtinSSI(transactionId, dlDomain, gtin, batch, expiration, callback) {
    //     if (typeof expiration === "function") {
    //         callback = expiration;
    //         expiration = undefined;
    //     }
    //
    //     if (typeof batch === "function") {
    //         callback = batch;
    //         batch = undefined;
    //     }
    //
    //     const body = {dlDomain, gtin, batch, expiration};
    //     const url = `/${this.holderInfo.domain}/gtin/${transactionId}`;
    //     doPost(url, JSON.stringify(body), callback);
    // }

    addFileDataToDossier(transactionId, domain, fileName, fileData, callback) {
        const url = `/${domain}/addFile/${transactionId}`;

        if (fileData instanceof ArrayBuffer) {
            fileData = new Blob([new Uint8Array(fileData)], {type: "application/octet-stream"});
        }
        let body = new FormData();
        let inputType = "file";
        body.append(inputType, fileData);

        doPost(url, body, {headers: {"x-dossier-path": fileName}}, callback);
    }

    mount(transactionId, domain, path, seed, callback) {
        const url = `/${domain}/mount/${transactionId}`;
        doPost(url, "", {
            headers: {
                'x-mount-path': path,
                'x-mounted-dossier-seed': seed
            }
        }, callback);
    }

    buildDossier(transactionId, domain, callback) {
        const url = `/${domain}/build/${transactionId}`;
        doPost(url, "", callback);
    }
}

module.exports = DSUService;

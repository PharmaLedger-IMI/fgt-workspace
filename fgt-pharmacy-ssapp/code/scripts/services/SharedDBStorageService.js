const CREDENTIAL_FILE_PATH = "/myKeys/credential.json";
const SHARED_DB = "sharedDB";
const SHARED_DB_FOLDER = "/sharedDB/data/";

export default class SharedStorage{
    constructor(dsuStorage) {
        this.mydb = window.sharedDbCache;
        this.DSUStorage = dsuStorage;
        this.DSUStorage.enableDirectAccess( ()=>{
            if(this.mydb == undefined){
                this.getSharedSSI( (err,sharedSSI) => {
                    if(!err && sharedSSI){
                        let opendsu = require("opendsu");
                        let db = opendsu.loadAPI("db");
                        this.mydb = db.getSharedDB(sharedSSI, SHARED_DB);
                        window.sharedDbCache = this.mydb;
                    } else {
                        alert("Wrong configuration as user/holder:" + err);
                    }
                })
            }
        });
    }

    waitForDb(func, args){
        func = func.bind(this)
        setTimeout(function(){
            func(...args);
        }, 10);
    }

    getItemInDB(key, callback) {
        if(this.mydb !== undefined){
            this.mydb.getRecord(SHARED_DB,key,function(err, res){
                if(err) return callback(err);
                if(typeof res.__stringValue != "undefined"){
                    callback(undefined, res.__stringValue)
                } else {
                    callback(undefined, res)
                }
            });
        } else {
            this.waitForDb(this.getItem, [key,callback]);
        }
    }

    setItemInDB(key, value,  callback) {
        if(typeof value == "string"){
            value = {__stringValue:value};
        }
        if(this.mydb){
            this.mydb.updateRecord(SHARED_DB,key,value, callback);
        } else {
            this.waitForDb(this.setItem, [key,value,callback]);
        }
    }

    getItem(key, callback) {
        if(this.mydb !== undefined){
            this.DSUStorage.getItem(SHARED_DB_FOLDER+key, callback);
        } else {
            this.waitForDb(this.getItem, [key,callback]);
        }
    }

    setItem(key, value,  callback) {
        if(this.mydb){
            console.log("Set Item:", SHARED_DB_FOLDER+key);
            this.DSUStorage.setItem(SHARED_DB_FOLDER+key, value, callback);
        } else {
            this.waitForDb(this.setItem, [key,value,callback]);
        }
    }

    getObject(key, callback) {
        if(this.mydb !== undefined){
            this.DSUStorage.getObject(SHARED_DB_FOLDER+key, function(err,res){
                if(err || !res){
                    res = {};
                }
                callback(undefined, res);
            });
        } else {
            this.waitForDb(this.getObject, [key,callback]);
        }
    }

    setObject(key, value,  callback) {
        if(this.mydb){
            console.log("Set Object:", SHARED_DB_FOLDER+key);
            this.DSUStorage.setObject(SHARED_DB_FOLDER+key, value, callback);
        } else {
            this.waitForDb(this.setObject, [key,value,callback]);
        }
    }

    getArray(key, callback) {
        if(this.mydb !== undefined){
            this.DSUStorage.getObject(SHARED_DB_FOLDER+key, function(err,res){
                if(err || !res){
                    res = [];
                }
                callback(undefined, res);
            });
        } else {
            this.waitForDb(this.getArray, [key,callback]);
        }
    }

    setArray(key, value,  callback) {
        if(this.mydb){
            console.log("Set Array:", SHARED_DB_FOLDER+key);
            this.DSUStorage.setObject(SHARED_DB_FOLDER+key, value, callback);
        } else {
            this.waitForDb(this.setArray, [key,value,callback]);
        }
    }

    addSharedFile(path, value, callback){
        throw Error("Not implemented")
    }

    getRecord(recordType, key, callback){
        throw Error("Not implemented")
    }

    setRecord(recordType, key, value, callback){
        throw Error("Not implemented")
    }

    getSharedSSI(callback){
        this.DSUStorage.getObject(CREDENTIAL_FILE_PATH, (err, credential) => {
            console.log("Got:", err, credential);
            if (err || !credential) {
                return callback(createOpenDSUErrorWrapper("Invalid credentials", err));
            } else {
                const crypto = require("opendsu").loadApi("crypto");
                const keyssi = require("opendsu").loadApi("keyssi");
                crypto.parseJWTSegments(credential.credential, (parseError, jwtContent) => {
                    if (parseError) {
                        return callback(createOpenDSUErrorWrapper('Error parsing user credential:',parseError));
                    }
                    console.log('Parsed credential', jwtContent);
                    callback(undefined, keyssi.parse(jwtContent.body.iss));
                });
            }
        });
    }
}
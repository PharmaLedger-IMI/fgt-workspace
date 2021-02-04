export default class SharedStorage {

    APP_TYPE = {
        CARDINAL: 'cardinal',
        SSAPP: 'ssapp'
    }

    constructor(dsuStorage) {
        this.DSUStorage = dsuStorage;
        this.appType = this.inIframe() ? this.APP_TYPE.SSAPP : this.APP_TYPE.CARDINAL;
    }

    inIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    getItem(keyName, format, callback) {
        switch (this.appType) {
            case this.APP_TYPE.SSAPP:
                this.getDSUStorageItem(keyName, format, callback)
                break;
            case this.APP_TYPE.CARDINAL:
                this.getLocalStorageItem(keyName, format, callback)
                break;
            default:
                callback("Application type does not have a implementation for getItem.")
        }
    }

    getDSUStorageItem(keyName, format, callback) {
        this.DSUStorage.getItem(keyName, format, (err, data) => {
            if (err) {
                // FALLBACK IN CASE THAT DSUSTORAGE FAILS.
                return this.getLocalStorageItem(keyName, format, callback);
            }
            callback(err, data);
        });
    }

    getLocalStorageItem(keyName, format, callback) {
        let value = localStorage.getItem(keyName);
        switch (format) {
            case "json":
                try {
                    value = JSON.parse(value);
                } catch (err) {
                    return callback(err);
                }
                break;
            default:
        }
        callback(undefined, value);
    }

    setItem(keyName, value, callback) {
        switch (this.appType) {
            case this.APP_TYPE.SSAPP:
                this.setDSUStorageItem(keyName, value, callback)
                break;
            case this.APP_TYPE.CARDINAL:
                this.setLocalStorageItem(keyName, value, callback)
                break;
            default:
                callback("Application type does not have a implementation for setItem.")
        }
    }

    setDSUStorageItem(keyName, value, callback) {
        this.DSUStorage.setItem(keyName, value, (err, data) => {
            if (err) {
                // FALLBACK IN CASE THAT DSUSTORAGE FAILS.
                return this.setLocalStorageItem(keyName, value, callback);
            }
            callback(err, data);
        });
    }

    setLocalStorageItem(keyName, value, callback) {
        if (typeof value === "object") {
            value = JSON.stringify(value);
        }
        localStorage.setItem(keyName, value);
        callback();
    }
}
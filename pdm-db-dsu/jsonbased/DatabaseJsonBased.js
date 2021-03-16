class DatabaseJson {
    /**
     * Initialize database.
     * @param {Archive} dsu 
     * @param {string} [pathPrefix=""] - If specified is prepended to key. No leading or trailing "/" are appended.
     */
    constructor(dsu, pathPrefix) {
        this.dsu = dsu;
        this.pathPrefix = pathPrefix || "";
    }

    /**
     * Retrieves the value.
     * @param {string} key
     * @param {function(err, string)} callback - where the string value retrieved.
     */
    get(key, callback) {
        this.dsu.readFile(this.pathPrefix+key, (err, buffer) => {
            if (err)
                return callback(err);
            callback(undefined, buffer.toString());
        });
    }

    /**
     * Set a value.
     * @param {string} key
     * @param {string} value 
     * @param {function(err, keyStringArray)} callback - keyStringArray is the array of string keys.
     */
     set(key, value, callback) {
        this.dsu.writeFile(this.pathPrefix+key, value, callback);
    }

    /**
     * List all keys under a specific key prefix.
     * @param {string} [key=""]
     * @param {function(err, keyStringArray)} callback - keyStringArray is the array of string keys.
     */
    list(key, callback) {
        this.dsu.listFiles(this.pathPrefix+(key||""), callback);
    }
}

module.exports = DatabaseJson;
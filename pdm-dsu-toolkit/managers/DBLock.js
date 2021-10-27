/**
 * Simple Database Lock system to handle minor concurrency issues
 *
 * @class DBLock
 * @memberOf Managers
 **/
class DBLock {
    _cache = {};
    _storage;
    _allows = {};
    _schedule = [];
    _timeout = 10;

    /**
     * @param {*} db DSU Database implementation
     * @param {number} timeout timeout for scheduling operations in ms. defaults to 10ms
     * @constructor
     */
    constructor(db, timeout){
        this._storage = db;
        this._timeout = timeout || this._timeout;
        console.log(`Created DB Lock`);
    }

    /**
     * @param {string} tableName
     * @returns {boolean} the DB Status regarding that table
     */
    isLocked(tableName){
        return this._cache[tableName] && this._cache[tableName] !== -1;
    }

    /**
     * Schedules a method call for after the current db operation has benn finished
     * @param {() => void} method
     */
    schedule(method){
        console.log(`Scheduling db method call...`)
        this._schedule.push(method);
    }

    /**
     * Allows a different manager to act in the current transaction
     * @param {string} tableName
     * @param {Manager} manager
     */
    allow(tableName, manager){
        const allowedTable = manager.tableName;
        if (this._allows[allowedTable])
            throw new Error(`Only one manager allowed`);

        this._allows[allowedTable] = tableName;
    }

    /**
     * Disallows a different manager to act in the current transaction
     * @param {string} tableName
     * @param {Manager} manager
     */
    disallow(tableName, manager){
        const allowedTable = manager.tableName;
        if (!this._allows[allowedTable])
            throw new Error(`Only no manager to disallow`);

        delete this._allows[allowedTable];
    }

    /**
     * Begins or continues a db batch operation depending if there's one in progress or not
     * @param {string} tableName
     * @throws {Error} error when a batch operation is already in progress
     */
    beginBatch(tableName){

        if (tableName in this._allows)
            tableName = this._allows[tableName]

        this._cache[tableName] = this._cache[tableName] || -1;

        if (this._cache[tableName] === -1){
            this._storage.beginBatch.call(this._storage);
            this._cache[tableName] = 1;
        } else {
            this._cache[tableName] += 1;
        }
    }

    /**
     * Checks is there are pending method calls and executes them in order
     * @private
     */
    _executeFromSchedule(){
        const method = this._schedule.shift();
        if (method){
            console.log(`Running scheduled db method call`);
            try {
                method();
            } catch (e) {
                console.log(`db method call failed. unshifting`, e);
                this._schedule.unshift(method);
            }
        }
    }

    /**
     * Commits or continues a db batch operation depending if the operation counter has run out
     * @param {string} tableName
     * @param {boolean} [force] when true forces the commit regardless of the counter. defaults to false
     * @param {(err) => void} callback
     */
    commitBatch(tableName, force, callback){
        if (!callback){
            callback = force;
            force = false;
        }

        if (tableName in this._allows)
            tableName = this._allows[tableName]

        if (this._cache[tableName] === -1)
            return callback();

        const self = this;

        this._cache[tableName] -= 1;
        if (force || this._cache[tableName] === 0){

            const cb = function(err){
                if (err)
                    return callback(err);
                if (self._schedule.length)
                    setTimeout(self._executeFromSchedule.bind(self), self._timeout);
                callback();
            }

            delete this._cache[tableName];
            this._allows = {};
            console.log(`Committing batch in ${tableName}`);
            return this._storage.commitBatch.call(this._storage, cb);
        }

        console.log(`Other Batch operations in progress in table ${tableName}. not committing just yet`)
        callback();
    }

    /**
     * Cancels the batch operation in progress
     * @param {string} tableName
     * @param {(err) => void} callback
     */
    cancelBatch(tableName, callback){
        if (this._cache[tableName] > 0){
            delete this._cache[tableName];
            return this._storage.cancelBatch.call(this._storage, callback);
        }
        callback();
    }
}

module.exports = DBLock;
class DBLock {
    _cache = {};
    _storage;
    _allows = {};
    _schedule = [];
    _timeout = 10;

    constructor(db, timeout){
        this._storage = db;
        this._timeout = timeout || this._timeout;
        console.log(`Created DB Lock`);
    }

    isLocked(tableName){
        return this._cache[tableName] && this._cache[tableName] !== -1;
    }

    schedule(method){
        console.log(`Scheduling db method call...`)
        this._schedule.push(method);
    }

    allow(tableName, manager){
        const allowedTable = manager.tableName;
        if (this._allows[allowedTable])
            throw new Error(`Only one manager allowed`);

        this._allows[allowedTable] = tableName;
    }

    disallow(tableName, manager){
        const allowedTable = manager.tableName;
        if (!this._allows[allowedTable])
            throw new Error(`Only no manager to disallow`);

        delete this._allows[allowedTable];
    }

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

    cancelBatch(tableName, callback){
        if (this._cache[tableName] > 0){
            delete this._cache[tableName];
            return this._storage.cancelBatch.call(this._storage, callback);
        }
        callback();
    }
}

module.exports = DBLock;
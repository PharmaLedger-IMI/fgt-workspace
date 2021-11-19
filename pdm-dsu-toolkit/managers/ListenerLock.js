/**
 * Simple Listener Lock system to handle minor concurrency issues
 *
 * @class ListenerLock
 * @memberOf Managers
 **/
 class ListenerLock {
    _activeReceiver = false;
    _schedule = [];

    /**
     * @constructor
     */
    constructor(){
        console.log(`Created Listener Lock`);
    }

    /**
     * @param {string} tableName
     * @returns {boolean} Checks if the Message Listener is trying to receive a message
     */
    isLocked(){
        return !this._activeReceiver;
    }

    /**
     * Schedules a method call for after the message Listener starts waiting for a new message
     * @param {() => void} method
     */
    schedule(method){
        console.log(`Scheduling Listener method call...`)
        this._schedule.push(method);
    }

    /**
     * Activates the lock
     */
    activateLock(){
        this._activeReceiver = false;
        console.log('activate lock: ',this.isLocked());
    }


    /**
     * Removes the lock and executes pending methods
     */
    deactivateLock(){
        this._activeReceiver = true;
        console.log('deactivate lock: ',this.isLocked());
        this._executeFromSchedule();
    }

    /**
     * Checks is there are pending method calls and executes them in order
     * @private
     */
     _executeFromSchedule(){
        const method = this._schedule.shift();
        if (method){
                console.log('schedule method run: ', method);
                method();
                if(!this._schedule.length > 0)
                    return
                this.deactivateLock();
            }
        return;
    }

}

module.exports = ListenerLock;
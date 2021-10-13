let eventHandler;

function submitEvent(conf, callback){
    let cb = callback;

    if (eventHandler)
        return eventHandler.submitEvent(callback);

    let timeOfLastEvent = Date.now();

    eventHandler =  {
        submitEvent: function(callback){
            cb = callback || cb;
            timeOfLastEvent = Date.now();
        }
    }

    const idInterval = setInterval(() => {
        if (Date.now() - timeOfLastEvent > 100 * conf.statusUpdateTimeout){
            clearInterval(idInterval);
            console.log(`### The Blockchain seems to be silent... Going to end the process...`);
            if (cb)
                return cb();
            process.exit(0);
        }
    }, 500); //will try every half second after the first call to see if the time since the last event is 10 times the status update timeout
}

module.exports = submitEvent;
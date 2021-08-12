let eventHandler;

function submitEvent(conf){
    if (eventHandler)
        return eventHandler.submitEvent();

    let timeOfLastEvent = Date.now();

    eventHandler =  {
        submitEvent: function(){
            timeOfLastEvent = Date.now();
        }
    }

    setInterval(() => {
        if (Date.now() - timeOfLastEvent > 5 * conf.statusUpdateTimeout){
            console.log(`The Blockchain seems to be silent... Going to end the process...`);
            process.exit(0);
        }
    }, 500); //will try every half second after the first call to see if the time since the last event is 10 times the status update timeout
}

module.exports = submitEvent;
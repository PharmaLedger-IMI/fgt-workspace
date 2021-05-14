process.env.NO_LOGS = true;

require("../../privatesky/psknode/bundles/openDSU");

const opendsu = require("opendsu");
const w3cDID = opendsu.loadApi('w3cdid');

let identifier;

process.on('message', (args) => {
    const {id, didMethod, messages, terminate} = args;

    if (terminate){
        console.log(`CONSUMER: Received termination notice. Shutting down listener for ${identifier}`);
        process.exit(0);
    }

    let messageCount = 0;
    w3cDID.createIdentity(didMethod, id, (err, did) => {
        if (err) {
            throw err;
        }
        identifier = did.getIdentifier();
        console.log(`CONSUMER: ${identifier} waiting for messages`);
        const listen = function(){
            console.log(`CONSUMER: Listening for messages on ${identifier}`);
            did.readMessage((err, msg) => {
                if(err){
                    console.log(`CONSUMER: ERROR:`, err);
                    return listen();
                }
                console.log(`CONSUMER: ${did.getIdentifier()} received message: ${JSON.stringify(msg)}`);
                if (++ messageCount === messages){
                    console.log(`CONSUMER: Received all ${messages} expected messages. Shutting down listener for ${identifier}`);
                    process.exit(0)
                }

                listen();
            });
        }

        listen();

        if (!args.timeout)
            return process.send(identifier);

        console.log(`CONSUMER: Waiting for ${args.timeout}ms for the listener to properly boot...`);
        setTimeout(() => {
            process.send(identifier);
        }, args.timeout)

    });
})
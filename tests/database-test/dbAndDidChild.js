process.env.NO_LOGS = true;

require("../../privatesky/psknode/bundles/openDSU");

const opendsu = require("opendsu");
const w3cDID = opendsu.loadApi('w3cdid');

process.on('message', (args) => {
    const {id, didMethod, messages} = args;
    let messageCount = 0;
    w3cDID.createIdentity(didMethod, id, (err, did) => {
        if (err) {
            throw err;
        }
        console.log(`${did.getIdentifier()} waiting for messages`);
        const listen = function(){
            console.log(`Listening for messages on ${did.getIdentifier()}`);
            did.readMessage((err, msg) => {
                if(err){
                    console.log(`ERROR:`, err);
                    return listen();
                }
                console.log(`${did.getIdentifier()} received message: ${JSON.stringify(msg)}`);
                if (++ messageCount === messages){
                    console.log(`Received all ${messages} expected messages. Shutting Down...`)
                    process.exit(0)
                }

                listen();
            });
        }
        listen();
        process.send(did.getIdentifier());
    });
})
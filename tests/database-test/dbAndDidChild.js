process.env.NO_LOGS = true;

require("../../privatesky/psknode/bundles/openDSU");

const opendsu = require("opendsu");
const w3cDID = opendsu.loadApi('w3cdid');

process.on('message', (id) => {
    w3cDID.createIdentity("demo", id, (err, did) => {
        if (err) {
            throw err;
        }
        console.log(`${did.getIdentifier()} waiting for messages`);
        const listen = function(){
            did.readMessage((err, msg) => {
                if(err){
                    console.log(`ERROR: ${err}`);
                    return listen();
                }
                console.log(`${did.getIdentifier()} received message: ${msg}`);
                listen();
            });
        }
        listen();
        process.send(id);
    });
})
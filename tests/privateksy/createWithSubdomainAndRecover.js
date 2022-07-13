// Ignore the test
// process.exit();

const domain = "default";
const subdomain = "traceability";

//Load openDSU enviroment
require("../../privatesky/psknode/bundles/openDSU");

//Load openDSU SDK
const opendsu = require("opendsu");

//Load resolver library
const resolver = opendsu.loadApi("resolver");

//Load keyssi library
const keyssispace = opendsu.loadApi("keyssi");

const sendError = function(err){
    console.log("Exception: ");
    console.log( err );
    process.exit(1)
}

const args = ["teststsets", "tesestsetst"]; // [Math.floor(Math.random() * 9999999), Math.floor(Math.random() * 9999999)]

const arraySSIWithSubDomain = keyssispace.createArraySSI(domain, args, undefined, subdomain);

resolver.createDSUForExistingSSI(arraySSIWithSubDomain, (err, dsu) => {
    if (err)
        return sendError(err)

    dsu.writeFile('/info.json', JSON.stringify("value"), (err) => {
        if (err)
            return sendError(err);

        dsu.getKeySSIAsObject((err, ssi) => {
            if (err)
                return sendError(err)

            console.log(ssi.getIdentifier(true));
            //
            // const arraySSIWithoutSubDomain = keyssispace.createArraySSI(domain, args);
            //
            // resolver.loadDSU(arraySSIWithoutSubDomain, (err, dsu2) => {
            //     if (err)
            //         return sendError(err)
            //
            //     dsu2.getKeySSIAsObject((err, ssi2) => {
            //         if (err)
            //             return sendError(err);
            //
            //         console.log(ssi2.getIdentifier(true));
            //
            //         console.log(dsu2);
            //     });
            // });
        });
    });
});








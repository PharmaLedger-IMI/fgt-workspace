// Ignore the test
process.exit();

//Load openDSU enviroment
require("../../privatesky/psknode/bundles/openDSU");

//Load openDSU SDK
const opendsu = require("opendsu");

//Load resolver library
const resolver = opendsu.loadApi("resolver");

//Load keyssi library
const keyssispace = opendsu.loadApi("keyssi");

const pskcrypto = require("../../privatesky/modules/pskcrypto");

//Create a template keySSI (for default domain). See /conf/BDNS.hosts.json
try {
    keyssispace.createSeedSSI('default', function (err, aSeedSSI) {

        console.log("seedSSI object:     " , aSeedSSI );
        console.log("seedSSI identifier: " + aSeedSSI.getIdentifier(true));

        let aData = { "message": "Hello world!" };

        //Create a DSU
        resolver.createDSU(aSeedSSI, (err, dsuInstance) => {
            //Reached when DSU created
            if (err) {
                console.log("Error creating DSU.");
                throw err;
            }

            //Methods found in: /modules/bar/lib/Archive.js
            dsuInstance.writeFile('/data', JSON.stringify(aData), (err) => {
                //Reached when data written to BrickStorage

                if (err) {
                    console.log("Error writing data to DSU.");
                    throw err;
                }
                console.log("Data written succesfully! :) ");


                dsuInstance.getKeySSIAsString((err, aKeySSIStr) => {
                    console.log("KeySSI identifier: ", aKeySSIStr); // KeySSI identifier:  BBudGH6ySHG6GUHN8ogNrTWbSXyuv5XvYDpjVH3L973ioh5WqYv39pk5DJMhgCA2WTtoyCP54cZazSg8ozXawX9ZZ

                    const anotherSeedSSI = keyssispace.parse(aKeySSIStr);
                    console.log("secretSSIObject = " , anotherSeedSSI); // dsuSecretSSI
                    const aReadSSI = anotherSeedSSI.derive();
                    console.log("sReadSSI object = " , aReadSSI);
                    console.log("sReadSSI identifier = " + aReadSSI.getIdentifier(true));

                    const aZaSSI = aReadSSI.derive();
                    console.log("sZaSSI object = " , aZaSSI);
                    console.log("sZaSSI identifier = " + aZaSSI.getIdentifier(true));

                    resolver.loadDSU(aKeySSIStr, (err, anotherDSUInstance) => {
                        if (err) {
                            console.log("Error loading DSU.");
                            throw err;
                        }

                        anotherDSUInstance.readFile('/data', (err, data) => {
                            //Reached when data loaded
                            if (err) {
                                console.log("Error reading data from the DSU.");
                                throw err;
                            }

                            const dataObject = JSON.parse(data.toString()); //Convert data (buffer) to string and then to JSON
                            console.log("Data load succesfully! :)", dataObject.message); //Print message to console
                            
                            console.log("");
                            console.log("DSU Keys: ");
                            console.log("  KeySSI:   " + pskcrypto.pskBase58Decode( aKeySSIStr ) );
                            console.log("  Read Key: " + aReadSSI.getIdentifier(true) );
                        });
                    });
                });
            });
        });
    });
} catch (exc ) {
 
    console.log("Exception: ");
    console.log( exc );
}







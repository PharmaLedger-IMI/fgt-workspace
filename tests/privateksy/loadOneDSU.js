// Ignore the test
//process.exit();

//Load openDSU enviroment
require("../../privatesky/psknode/bundles/openDSU");

//Load openDSU SDK
const opendsu = require("opendsu");

//Load resolver library
const resolver = opendsu.loadApi("resolver");

//Load keyssi library
const keyssispace = opendsu.loadApi("keyssi");

if (!process.argv || process.argv.length<3) {
    console.log("Usage:\n\tnode loadOneDSU.js KEYSSI");
    process.exit(1);
}

//Create a template keySSI (for default domain). See /conf/BDNS.hosts.json
//const aKeySSI = "ssi:sread:default:GfQ33HRQywE5nD1AuonozFNgjj7yXpK9bGwVR1xapuT4:255nSKKXmg3B4DhQ4BoU2S53odRAuPHxAgSYjGv1sLCR:v0";
//const aKeySSI = "BBudGH6ySHG6GUHN8ogNrTWbvGyG1VRGoheZpyY8Zv3WfY5LBSdPN6hkJwveRNnce1PQEGNpWvTKi7NkLeug9qeTy";
const aKeySSI = process.argv[2];
console.log("KEYSSI=",aKeySSI);

//Load a DSU
try {
    resolver.loadDSU(aKeySSI, (err, aDsuInstance) => {
        //Reached when DSU loaded
        if (err){
            console.log("Error loading DSU:");
            throw err;
        }
        console.log("DSU loaded OK");

        // list Top Level files
        aDsuInstance.listFiles(
            "/",
            {
                ignoreMounts: true,
                recursive: false
            },
            function (err, files) {
                if (err) {
                    console.log("TopLevel listFiles / failed with ", err);
                }
                console.log("TopLevel Files " + files);
            }
        );

        // Recursive list all files
        aDsuInstance.listFiles(
            "/",
            {
                ignoreMounts: false,
                recursive: true
            },
            function (err, files) {
                if (err) {
                    console.log("listFiles / failed with ", err);
                }
                console.log("Files " + files);
            }
        );
        aDsuInstance.listFolders("/", function (err,folders) {
            if (err) {
                console.log("listFolders / failed with ", err);
            }
            console.log("Folders "+folders);
        });
        
        /*
        aDsuInstance.readFile('/dsu-metadata-log', (err, data)=>{
            //Reached when data loaded
            if(err){
                console.log("DSU dsu-metadata-log readfile error: ");
                throw err;
            }
            
            console.log("dsu-metadata-log load succesfully! :", data.toString());
        });
        */

        /*
        aDsuInstance.readFile('/data', (err, data)=>{
            //Reached when data loaded
            if(err){
                console.log("DSU data readfile error: ");         
                throw err;
            }
            
            const dataObject = JSON.parse(data.toString()); //Convert data (buffer) to string and then to JSON
            console.log("Data load succesfully! :) -> ", dataObject.message); //Print message to console
            dataObject.message += " ... more!";
            console.log("Data changed :)           -> ", dataObject.message); //Print message to console

            aDsuInstance.writeFile("/data", JSON.stringify(dataObject), (err) => {
                if (err) {
                    console.log("DSU write readfile error: ");
                    throw err;
                }
                console.log("Data written succesfully! :)");
            });
        });
        */
    });
} catch (ex ) {
    
    console.log("Exception:");
    console.log( ex );
}






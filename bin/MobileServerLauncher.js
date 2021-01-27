let arguments = {};

//set the path to a folder that contains a "server.json" in order to customize the configuration
//process.env.PSK_CONFIG_LOCATION = "../apihub-root/external-volume/config";

if (process.argv.length > 2) {
    for(let idx in process.argv){
        let argument = process.argv[idx].replace('--', '').split('=');
        let arg_name = argument[0];
        let arg_value = argument[1];
        arguments[arg_name] = arg_value;
    }
}

console.log("Received arguments =  " + arguments);


const pskBundle = arguments.bundle || "../privatesky/psknode/bundles/pskWebServer";
require(pskBundle);

if(typeof arguments.env !== 'undefined'){
    try{
        let env = JSON.parse(arguments.env);
        for (let prop in env){
            process.env[prop] = env[prop];
        }
    } catch(e){
        console.log("Failed to parse env argument ", e);
    }
}

const TAG = "MOBILE-API-HUB";
const path = require("swarmutils").path;
const API_HUB = require('apihub');



let config = API_HUB.getServerConfig();

const listeningPort = arguments.port || Number.parseInt(config.port);
const rootFolder = arguments.rootFolder || path.resolve(config.storage);

config.storage = rootFolder;

console.log("Listening port: " + listeningPort);
console.log("Root folder: " + rootFolder);

API_HUB.createInstance(listeningPort, rootFolder, (err) => {
    if (err) {
        console.error(err);
    }
    console.log(`\n[${TAG}] listening on port :${listeningPort} and ready to receive requests.\n`);

    //Write Android PID to a file
    fs = require('fs');
    let apicFilePath = rootFolder + '/pid';
    console.log(`\n[${TAG}] APIC file :${apicFilePath} .\n`);
    console.log(`\n[${TAG}] APIC arguments: `,  arguments.apic);
    fs.writeFile(apicFilePath, arguments.apic , function (err) {
        if (err) {
            return console.log(err);
        }
    });
});
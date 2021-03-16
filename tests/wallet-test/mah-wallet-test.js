process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();
console.log("This test is deprecated. Skipping");
process.exit(1)

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'testsRuntime.js'));     // test runtime
require(path.join('../../privatesky/psknode/bundles', 'pskruntime.js'));       // the whole 9 yards, can be replaced if only smaller modules are needed
const tir = require("../../privatesky/psknode/tests/util/tir");                // the test server framework

const dc = require("double-check");
const assert = dc.assert;

let domain = 'traceability';
let testName = 'MAH_wallet_test';

const CLEAR_DATA_AT_END = true;

const MAH_WALLET_NAME = 'fgt-mah-wallet';

function createMockApiHubStructure(appName, testFolder, callback){
    try{
        let apiHubRootFolder = "../../apihub-root";
        console.log(`Replicating ${appName}`);
        require('fs').symlinkSync(path.join(process.cwd(), apiHubRootFolder, appName), path.join(testFolder, appName));
        console.log(`Recreation of environment for ${appName} complete`);
        callback();
    } catch (err){
        return callback(err);
    }
}

function copyConfigs(testFolder, callback){
    const fs = require('fs');
    if (!fs.existsSync(testFolder))
        return callback("path does not exist");
    let configPath = path.join(testFolder,'external-volume/config');
    fs.mkdirSync(configPath, {recursive: true});
    fs.copyFileSync('server.json', path.join(configPath, 'server.json'));
    process.env.PSK_CONFIG_LOCATION = configPath;
    callback();
}

function replicateEnvironment(testFolder, callback){
    console.log("Replicating Environment")
    copyConfigs(testFolder, (err) => {
        if (err)
            return callback(err);
        createMockApiHubStructure(MAH_WALLET_NAME, testFolder, (err) => {
            if (err)
                return callback(err);
            console.log(`Recreation of environment at ${testFolder} complete`);
            callback();
        });
    });
}

function clearFiles(testFolder, callback){
    const fs = require('fs');
    if (!fs.existsSync(testFolder))
        return callback();
    console.log("Clearing test files...")
    fs.rmdirSync(testFolder, {recursive: true})
    callback();
}

function bindCallbackBehaviour(folder, callback){
    if (CLEAR_DATA_AT_END)
        return () => {
            clearFiles(folder, (err) => {
                if (err)
                    console.log("Could not delete test files...");
                callback();
            });
        }
    return callback;
}

function register(role, sReadSSI, callback){
    let url = `${process.env.BDNS_ROOT_HOSTS}/${domain}/register/${role}`
    doPost(url, sReadSSI.getIdentifier(true), callback);
}

function createMAHWallet(callback){

    let role = 'mah';

    let arrayWithSecrets = [
        "MAH Legal Name",
        "MAH registered trading number",
        "MAH company id reference",
        "MAH other stuff"
    ]

    const WalletBuilderService = require('../../fgt-dsu-wizard/services/WalletService');

    const walletBuilder = new WalletBuilderService({
        codeFolderName: "code",
        walletTemplateFolderName: "wallet-patch",
        appFolderName: MAH_WALLET_NAME,
        appsFolderName: "apps-patch",
        ssiFileName: "seed",
        environmentDomain: "traceability",
        vault: "vault"
    });

    walletBuilder.build(arrayWithSecrets, (err, wallet) => {
        if (err)
            return callback(err);
        wallet.getKeySSIAsObject((err, keySSI) => {
            if (err)
                return callback(err);
            console.log(`${role}'s wallet has been created with keyssi: ${keySSI.getIdentifier(true)}`);
            let sReadSSI = keySSI.derive();
            register('mah', sReadSSI, (err) => {
                if (err)
                    return callback(err);
                callback(undefined, wallet);
            });
        });
    });
}

function doPost(url, data, options, callback) {
    const http = require("opendsu").loadApi("http");
    if (typeof options === "function") {
        callback = options;
        options = {};
    }

    if (typeof data === "function") {
        callback = data;
        options = {};
        data = undefined;
    }

    url = `${url}#x-blockchain-domain-request`
    http.doPost(url, data, options, (err, response) => {
        if (err)
            return callback(err);
        callback(undefined, response);
    });
}

assert.callback(testName, (testFinished) => {
    dc.createTestFolder(testName, (err, folder) => {
        testFinished = bindCallbackBehaviour(folder, testFinished);
        replicateEnvironment(folder, (err) => {
            if (err)
                throw err;
            tir.launchApiHubTestNode(10, folder, err => {
                if (err)
                    throw err;
                tir.addDomainsInBDNS(folder,  [domain], (err, bdns) => {    // not needed if you're not working on a custom domain
                    if (err)
                        throw err;
                    console.log('Updated bdns', bdns);
                    createMAHWallet((err, wallet) => {
                        if (err)
                            throw err;
                        console.log(wallet);
                        testFinished();
                    });
                });
            });
        })
    });
}, 3000);    // you have 3 seconds for it to happen

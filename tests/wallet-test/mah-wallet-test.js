process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');
const testUtils = require('../testUtils');

require(path.join('../../privatesky/psknode/bundles', 'testsRuntime.js'));     // test runtime
require(path.join('../../privatesky/psknode/bundles', 'pskruntime.js'));       // the whole 9 yards, can be replaced if only smaller modules are needed
const tir = require("../../privatesky/psknode/tests/util/tir");                // the test server framework

const dc = require("double-check");
const assert = dc.assert;

let domain = 'traceability';
let testName = 'MAH_wallet_test';

const model = require('../../fgt-dsu-wizard/model');

const WalletBuilderService = require('../../fgt-dsu-wizard/services/WalletService');

const MAH_WALLET_NAME = 'fgt-mah-wallet';

function createMockApiHubStructure(appName, testFolder, callback){
    try{
        let apiHubRootFolder = "../../apihub-root";
        testUtils.copyFolderRecursiveSync(path.join(apiHubRootFolder, appName), testFolder);
        console.log(`Recreation of environment at ${testFolder} complete`);
        callback();
    } catch (err){
        return callback(err);
    }
}


function createMAHWallet(callback){

    let arrayWithSecrets = [
        "MAH Legal Name",
        "MAH registered trading number",
        "MAH company id reference",
        "MAH other stuff"
    ]

    const walletBuilder = new WalletBuilderService({
        codeFolderName: "code",
        walletTemplateFolderName: "wallet-patch",
        appFolderName: MAH_WALLET_NAME,
        appsFolderName: "apps-patch",
        ssiFileName: "seed",
        environmentDomain: "default",
        vault: "vault"
    });

    walletBuilder.build(arrayWithSecrets, (err, wallet) => {
        if (err)
            return callback(err);
        callback(undefined, wallet);
    });
}

assert.callback(testName, (testFinished) => {
    dc.createTestFolder(testName, (err, folder) => {
        createMockApiHubStructure(MAH_WALLET_NAME, folder, (err) => {
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

// Ignore the test
//process.exit();

require("../../../privatesky/psknode/bundles/testsRuntime");

const tir = require("../../../privatesky/psknode/tests/util/tir");
const dc = require("double-check");
const assert = dc.assert;


const opendsu = require("opendsu");
const w3cDID = opendsu.loadApi('w3cdid');

const DID_METHOD = "ssi:name";
const domain = 'default';
const NAME = 'publicName';


assert.callback('w3cDID MQ Producer test', (testFinished) => {
    w3cDID.createIdentity(DID_METHOD, domain, NAME, (err, did) => {
        if (err)
            throw err;
       
        console.log(did);
        testFinished();
    });
}, 45000);
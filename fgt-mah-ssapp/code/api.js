const securityContext = require("opendsu").loadApi("sc");
const mainDSU = securityContext.getMainDSU();

function mountDSU(path, keySSI, callback) {
    mainDSU.mount(path, keySSI, function(err,res){
        console.log("mount APIs", err, res);
        callback(err, res)
    });
}
module.exports = {
    mountDSU
}
const api = require('./api');
const {initApis, APPS} = require('../../utils');

const init = function(server){
    initApis(server, api, APPS.MAH);
}

module.exports = {
    init
}
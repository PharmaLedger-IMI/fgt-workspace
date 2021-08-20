
function genDate(offsetFromToday){
    let date = new Date();
    date.setDate(date.getDate() + offsetFromToday);
    return date;
}

function generateGtin(){
    function pad(n, width, padding) {
        padding = padding || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(padding) + n;
    }

    const beforeChecksum = pad(Math.floor(Math.random() * 9999999999999), 13); // has to be 13. the checksum is the 4th digit
    const checksum = calculateGtinCheckSum(beforeChecksum);
    return `${beforeChecksum}${checksum}`;
}

function validateGtin(gtin){
    gtin = gtin + '';
    if (!gtin.match(/\d{14}/g))
        return false
    const digits = gtin.splice(0, 13);
    const checksum = calculateGtinCheckSum(digits);
    return parseInt(checksum) === parseInt(gtin.charAt(13));
}

// https://www.gs1.org/services/how-calculate-check-digit-manually
function calculateGtinCheckSum(digits){
    digits = '' + digits;
    if (digits.length !== 13)
        throw new Error(`needs to received 13 digits`);
    const multiplier = [3,1,3,1,3,1,3,1,3,1,3,1,3];
    let sum = 0;
    try {
        // multiply each digit for its multiplier according to the table
        for (let i = 0; i < 13; i++)
            sum += parseInt(digits.charAt(i)) * multiplier[i];

        // Find the nearest equal or higher multiple of ten
        const remainder = sum % 10;
        let nearest;
        if (remainder  === 0)
            nearest = sum;
        else
            nearest = sum - remainder + 10;

        return nearest - sum;
    } catch (e){
        throw new Error(`Did this received numbers? ${e}`);
    }
}

function generateProductName() {
    const syllables = ["aba", "xo", "ra", "asp", "pe", "cla", "ri", "bru", "be", "nu", "as", "cos", "sen"];
    const suffixes = ['gix', 'don', 'gix', 'fen', 'ron', 'tix'];
    const name = [];

    let syllableCount = Math.floor(Math.random() * 4) + 2;
    while (syllableCount >= 0){
        name.push(syllables[Math.floor(Math.random() * syllables.length)]);
        syllableCount --;
    }
    name.push(suffixes[Math.floor(Math.random() * suffixes.length)]);
    return name.join('');
}

function generateBatchNumber(length = 6){
    const chars = 'ABCDEFGHIJKLMNOPQRSUVWXYZ';
    const numbers = '1234567890';
    const options = [chars, numbers];
    const batchNumber = []
    for (let i = 0 ; i < length; i++){
        const slot = Math.floor(Math.random() * 2);
        batchNumber.push(options[slot].charAt(Math.floor(Math.random() * options[slot].length)));
    }
    return batchNumber.join('');
}

function generateRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function impersonateDSUStorage(dsu){
    dsu.directAccessEnabled = false;
    dsu.enableDirectAccess = (callback) => callback();

    const setObject = function(path, data, callback) {
        try {
            dsu.writeFile(path, JSON.stringify(data), callback);
        } catch (e) {
            callback(createOpenDSUErrorWrapper("setObject failed", e));
        }
    }

    const getObject = function(path, callback) {
        dsu.readFile(path, (err, data) => {
           if (err)
               return callback(createOpenDSUErrorWrapper("getObject failed" ,err));

           try{
               data = JSON.parse(data);
           } catch (e){
               return callback(createOpenDSUErrorWrapper(`Could not parse JSON ${data.toString()}`, e));
           }
           callback(undefined, data);
        });
    }

    dsu.getObject = getObject;
    dsu.setObject = setObject;
    return dsu;
 }

const argParser = function(defaultOpts, args){
    let config = JSON.parse(JSON.stringify(defaultOpts));
    if (!args)
        return config;
    args = args.slice(2);
    const recognized = Object.keys(config);
    const notation = recognized.map(r => '--' + r);
    args.forEach(arg => {
        if (arg.includes('=')){
            let splits = arg.split('=');
            if (notation.indexOf(splits[0]) !== -1) {
                let result
                try {
                    result = eval(splits[1]);
                } catch (e) {
                    result = splits[1];
                }
                config[splits[0].substring(2)] = result;
            }
        }
    });
    return config;
}

const parseEnvJS = function(strEnv){
    return JSON.parse(strEnv.replace(/^export\sdefault\s/, ''));
}

const getEnvJs = function(app, pathToApps,callback){
    const appPath = require('path').join(process.cwd(), pathToApps, "trust-loader-config", app, "loader", "environment.js");
    require('fs').readFile(appPath, (err, data) => {
        if (err)
            return callback(`Could not find Application ${app} at ${{appPath}} : ${err}`);
        return callback(undefined, parseEnvJS(data.toString()));
    });
}

const instantiateSSApp = function(app, pathToApps, dt, credentials, callback){
    getEnvJs(app, pathToApps,(err, env) => {
        if (err)
            throw err;

        let config = require("opendsu").loadApi("config");
        config.autoconfigFromEnvironment(env);

        const appService = new (dt.AppBuilderService)(env);
        appService.buildWallet(credentials, (err, keySII, dsu) => {
            if (err)
                throw err;
            console.log(`App ${env.appName} created with credentials ${JSON.stringify(credentials, undefined, 2)}.\nSSI: ${{keySII}}`);
            callback(undefined, keySII, dsu, credentials);
        });
    });
}

function jsonStringifyReplacer(key, value){
    if(key === 'manager' && value.constructor.name)
        return value.constructor.name;
    if (key === 'serialNumbers')
        return value.join(', ');
    return value;
}

module.exports = {
    generateProductName,
    generateGtin,
    validateGtin,
    calculateGtinCheckSum,
    generateBatchNumber,
    generateRandomInt,
    genDate,
    impersonateDSUStorage,
    getEnvJs,
    parseEnvJS,
    argParser,
    instantiateSSApp,
    jsonStringifyReplacer
}
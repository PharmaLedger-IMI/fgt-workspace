const path = require("path");
const fs = require("fs");


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

const defaultOptions = {
    role: "mah",
    endPoint: ""
}

const getEndpoint = function(role){
    switch (role){
        case "mah":
            return "http://localhost:8081/traceability"
        case "whs":
            return "http://localhost:3001/traceability"
        case "pha":
            return "http://localhost:3002/traceability"
    }
}

const options = argParser(defaultOptions, process.argv);

if (!options.endPoint)
    options.endPoint = getEndpoint(options.role);

function readCredentialsFile(role){
    const getPath = () => {
        const buildPath = (name) => `fgt-${name}-wallet`;
        switch (role){
            case "mah":
                return buildPath("mah");
            case "whs":
                return buildPath("wholesaler");
            case "pha":
                return buildPath("pharmacy");
            default:
                throw new Error("Invalid Role")
        }
    }

    return new Promise((resolve, reject) => {
        fs.readFile(path.join(process.cwd(), "fgt-api/config", getPath(), "credentials.json"), (err, data) => err
            ? reject(err)
            : resolve(data))
    })
}

function parseCredentialsFile(data){
    return new Promise((resolve, reject) => {
        try {
            data = JSON.parse(data);
        } catch(e) {
            return reject(e);
        }
        resolve(data);
    });
}

function transformCredentialsFile(data){
    return new Promise((resolve, reject) => {
        try {
            data = Object.entries(data).reduce((accum, [key, value]) => {
                if (value.public)
                    accum[key] = value.secret
                return accum;
            }, {})
        } catch (e) {
            return reject(e);
        }
        resolve(data);
    })
}

function writeCredentialsFile(data){
        return new Promise((resolve, reject) => {
        fs.writeFile(path.join(process.cwd(), "apihub-root/dashboard/identity.json"), JSON.stringify(data), err => err
            ? reject(err)
            : resolve(data))
    })
}

function writeEndpointFile(){
        const data = JSON.stringify(options.endPoint)
        return new Promise((resolve, reject) => {
        fs.writeFile(path.join(process.cwd(), "apihub-root/dashboard/endpoint.json"), data, err => err
            ? reject(err)
            : resolve(options.endPoint))
    })
}
function outputResult(data){
    console.log("Data exported to Dashboard Api: " + JSON.stringify(data, undefined, 2))
}

readCredentialsFile(options.role)
    .then(parseCredentialsFile)
    .then(transformCredentialsFile)
    .then(writeCredentialsFile)
    .then(outputResult)
    .then(writeEndpointFile)
    .then(outputResult)
    .catch(console.error)
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

const config = argParser({
    port: process.env.SWAGGER_PORT || 3009,
    participant: process.env.SWAGGER_PARTICIPANT || "MAH" || "PHA" || "WHS",
    path: process.env.SWAGGER_PATH || './docs',
    server: process.env.SWAGGER_SERVER || 'http://localhost:8081/traceability'
}, process.argv);

module.exports = config;


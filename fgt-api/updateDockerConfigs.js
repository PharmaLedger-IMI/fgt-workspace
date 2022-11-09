let {ENVIRONMENT, bricksDomain} = process.env;
const fs = require('fs');
const path = require('path');

const currentPath = process.cwd();

const updateConfigsToMatchEnvironment = async function(){
    return new Promise((resolve, reject) => {
        const environment = ENVIRONMENT || "local";
        console.log(`Updating environment configurations for the ${environment} environment ${bricksDomain ? `using bricksDomain: ${bricksDomain}` : ""}`)
        try {
            fs.copyFileSync(path.join(currentPath, `../fgt-bdns/${environment}/apihub.json`),
                path.join(currentPath, `../apihub-root/external-volume/config/apihub.json`))
        } catch (e) {
            return reject(e);
        }
        resolve();
    })
}

updateConfigsToMatchEnvironment().then(_ => {
    console.log("Environment updated");
}).catch(e => {
    console.error(e)
    process.exit(1)
})
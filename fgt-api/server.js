const {ROLE, CREDENTIALS_FILE, SWAGGER_SERVER} = process.env;
const fs = require('fs');
const path = require('path');

const currentPath = process.cwd();

if (!ROLE){
    console.log("No ROLE Definition found. Assuming simple APIHUB")
    process.exit(0);
}

console.log(`ENVIRONMENT VARIABLES: ROLE: ${ROLE}`)

function failServerBoot(reason){
    console.error("Server boot failed: " + reason);
    process.exit(1);
}

function getWallet(){
    switch (ROLE){
        case "mah":
            return "mah";
        case "whs":
            return 'wholesaler';
        case "pha":
            return "pharmacy";
        default:
            return ROLE;
    }
}

function overWriteCredentialsByRole(){
    fs.copyFileSync(path.join(currentPath, "..", "docker", "api", "env", CREDENTIALS_FILE),
        path.join(currentPath, "config", `fgt-${getWallet()}-wallet`, "credentials.json"))
}

function bootAPIServer(){
    require(path.join(currentPath, "participants", ROLE, "index.js"));
}

try {
    overWriteCredentialsByRole();
    bootAPIServer();
} catch (e){
    failServerBoot(e.message);
}


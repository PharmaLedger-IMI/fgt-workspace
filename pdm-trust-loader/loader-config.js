import configConstants from './config-constants.js';
window.LOADER_GLOBALS = configConstants;

let linkElement = document.createElement("link");
let theme = LOADER_GLOBALS.THEME;
linkElement.href = "assets/css/" + theme + ".css";
linkElement.type = "text/css";
linkElement.rel = "stylesheet";
document.head.appendChild(linkElement);


if (LOADER_GLOBALS.PLUGIN_SCRIPT) {
	let scriptElement = document.createElement("script");
	scriptElement.src = LOADER_GLOBALS.PLUGIN_SCRIPT;
	scriptElement.type = "module";
	document.body.appendChild(scriptElement);
}


import env from "./environment.js";

LOADER_GLOBALS.environment = env;

LOADER_GLOBALS.LOCALSTORAGE_CREDENTIALS_KEY = env.appName + "-credentials";

LOADER_GLOBALS.saveCredentials = function(){
	localStorage.setItem(LOADER_GLOBALS.LOCALSTORAGE_CREDENTIALS_KEY, JSON.stringify(LOADER_GLOBALS.credentials));
}

LOADER_GLOBALS.loadCredentials = function(){
	let knownCredentials = localStorage.getItem(LOADER_GLOBALS.LOCALSTORAGE_CREDENTIALS_KEY);
	if (!knownCredentials) {
		knownCredentials = "{}";
	}
	LOADER_GLOBALS.credentials =  JSON.parse(knownCredentials);
}

LOADER_GLOBALS.loadCredentials();

if (typeof require !== 'undefined') {
    let config = require("opendsu").loadApi("config");
    config.autoconfigFromEnvironment(LOADER_GLOBALS.environment);
}
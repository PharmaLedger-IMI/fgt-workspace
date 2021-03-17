import env from "./environment.js";

// let base_el = document.createElement('base');
// base_el['href'] = env.basePath;
// document.querySelector('head').prepend(base_el);

if (typeof require !== 'undefined') {
    let config = require("opendsu").loadApi("config");
    config.autoconfigFromEnvironment(env);
}
/**
 * @module loader
 */

/**
 *
 */
import env from "./environment.js";

// Handle theme
let linkElement = document.createElement("link");
let theme = env.theme;
linkElement.href = "assets/css/" + theme + ".css";
linkElement.type = "text/css";
linkElement.rel = "stylesheet";
document.head.appendChild(linkElement);

// Handle Base Element - should not run if inside iframe
if (!window.frameElement){
    let base_el = document.createElement('base');
    base_el['href'] = env.basePath;
    document.querySelector('head').prepend(base_el);
}

if (typeof require !== 'undefined') {
    let config = require("opendsu").loadApi("config");
    config.autoconfigFromEnvironment(env);
}
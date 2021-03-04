/**
 * @module fgt-mah-ssapp.managers
 */

/**
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons
 */

import {getIdManager} from "./IdManager.js";
import {getProductManager} from "./ProductManager.js";
import {getBatchManager} from "./BatchManager.js";

export{
    getIdManager,
    getBatchManager,
    getProductManager
}
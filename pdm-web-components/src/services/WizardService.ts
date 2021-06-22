/**
 * @namespace Wizard
 * @memberOf Services
 */


let wizardCache;

let wizard;

if (!wizard){
  try{
    // @ts-ignore
    wizardCache = require('wizard');
  } catch (e){
    // @ts-ignore
    wizardCache = require('toolkit'); // fallback for the loader
  }
}

/**
 * Exposes a limited subset of dsu-wizard's functionality
 * @memberOf Wizard
 */
wizard = {
  Constants: wizardCache.Constants,
    Model: wizardCache.Model,
    Managers: wizardCache.Managers,
    LocaleService: wizardCache.Services.WebcLocaleService
}

/**
 * Gives access the the bundled 'wizard/toolkit' without only one import
 * @memberOf Wizard
 * @see wizard
 */
export default wizard;

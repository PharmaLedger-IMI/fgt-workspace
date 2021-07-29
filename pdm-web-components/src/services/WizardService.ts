/**
 * @namespace Wizard
 * @memberOf Services
 */


let wizardCache = {
  Constants: {},
  Model: {},
  Services: {
    WebcLocaleService: {},
  },
  Managers: {}
};

let wizard;

if (!wizard){
  try{
    // @ts-ignore
    wizardCache = require('wizard');
  } catch (e){
    try{
      // @ts-ignore
      wizardCache = require('toolkit'); // fallback for the loader
    } catch (e){
      console.log(`Could not find Wizard in environment`);
    }
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

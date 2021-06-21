
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

wizard = {
  Constants: wizardCache.Constants,
    Model: wizardCache.Model,
    Managers: wizardCache.Managers,
    LocaleService: wizardCache.Services.WebcLocaleService
}

/**
 * Gives access the the bundled 'wizard/toolkit' without only one import
 * @module Services.Wizard
 */
export default wizard;

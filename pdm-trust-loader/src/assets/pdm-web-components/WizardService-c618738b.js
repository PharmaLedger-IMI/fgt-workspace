let wizard;
try {
  // @ts-ignore
  wizard = require('wizard');
}
catch (e) {
  // @ts-ignore
  wizard = require('toolkit'); // fallback for the loader
}
/**
 * Gives access the the bundled 'wizard' without only one import
 * @module Services.Wizard
 */
const wizard$1 = {
  Constants: wizard.Constants,
  Model: wizard.Model,
  Managers: wizard.Managers
};

export { wizard$1 as w };

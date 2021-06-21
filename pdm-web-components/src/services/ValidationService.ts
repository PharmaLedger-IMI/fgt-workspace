import wizard from './WizardService';
const {Registry, Validator, Validators} = wizard.Model.Validations.Validators;
const {INPUT_FIELD_PREFIX} = wizard.Constants

/**
 * Handles equality validation between fields
 * @class EqualityValidator
 * @extends Validator
 */
class EqualityValidator extends Validator {
  /**
   * @param {string} errorMessage
   * @constructor
   */
  constructor(errorMessage = "This field must be equal to field {0}!") {
    super("equality", errorMessage);
  }

  /**
   * returns the error message, or nothing if is valid
   * @param value the value
   * @param {string} fieldName the pattern to validate
   * @return {string | undefined} the errors or nothing
   */
  hasErrors(value, fieldName){

    const el: HTMLFormElement = document.body.querySelector(`input[name="${INPUT_FIELD_PREFIX}${fieldName}"]`);
    if (!el)
      return console.log(`Could not find field ${fieldName} to perform equality validation. Assuming valid`);
    if (el.value !== value)
      return this.errorMessage;
  }
}

Registry.register(EqualityValidator);

export const ValidationService = {
  Registry: Registry,
  Validators: Object.assign({}, Validators, {
      EqualityValidator: EqualityValidator
    }),
  INPUT_FIELD_PREFIX: INPUT_FIELD_PREFIX
}

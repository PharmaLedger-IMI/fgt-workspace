/**
 * @module fgt-dsu-wizard.model
 */

/**
 * @param {string} email
 * @returns {string|undefined} undefined if ok, the error otherwise
 */
const validateEmail = function(email){
    if (!email) return
    if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(email))
        return "Invalid email";
}

/**
 * Validates a tin number
 * @param {string|number} tin
 * @returns {string|undefined} undefined if ok, the error otherwise
 */
const validateTin = function(tin){
    if (!tin) return;
    if (/^\d{,9}$/.test(tin))
        return "Not a valid Tin";
}

/**
 * Test a specific type of Ionic input field for errors
 * @param {string} type the field type
 * @param {string|number} value the field value
 * @param {boolean} required if the field is required or not
 */
const hasErrors = function(type, value, required){
    if (required && !value)
        return "Field is required";

    switch (type){
        case "email":
            return validateEmail(value);
        case "tin":
            return validateTin(value);
        default:
            return;
    }
}

/**
 * Provides the implementation for the Model to be validatable via Ionic components
 */
class Validatable{
    validateIonic(){
        let error;
        for (let prop in this)
            if (this.hasOwnProperty(prop)){
                error = hasErrors(prop, this[prop], this[prop].required);
                if (error)
                    return error;
            }
    }
}

module.exports = {
    Validatable,
    hasErrors
};
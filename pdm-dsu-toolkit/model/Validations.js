/**
 * @namespace Validations
 * @memberOf Model
 */

/**
 * Supported ion-input element types
 * @memberOf Validations
 */
const ION_TYPES = {
    EMAIL: "email",
    NUMBER: "number",
    TEXT: "text",
    DATE: "date"
}

/**
 * Supported ion-input element sub-types (under the {@link ION_CONST.name_key})
 * @memberOf Validations
 */
const SUB_TYPES = {
    TIN: "tin"
}

/**
 * @memberOf Validations
 */
const QUERY_ROOTS = {
    controller: "controller",
    parent: "parent",
    self: "self"
}
/**
 * Html attribute name constants
 *
 * mostly straightforward with the notable exceptions:
 *  - {@link ION_CONST.error.append} variable append strategy - que root of the css query
 *  - {@link ION_CONST.error.queries}:
 *    - {@link ION_CONST.error.queries.query} the media query that while be made via {@link HTMLElement#querySelectorAll}
 *    - {@link ION_CONST.error.queries.variables} variables that will be set/unset:
 *       the keys will be concatenated with '--' eg: key => element.style.setProperty('--' + key, variables[key].set)
 *
 *       The placeholder ${name} can be used to mark the field's name
 * @memberOf Validations
 */
const ION_CONST = {
    name_key: "name",
    type_key: "type",
    required_key: "required",
    max_length: "maxlength",
    min_length: "minlength",
    max_value: "max",
    min_value: "min",
    input_tag: "ion-input",
    error: {
        queries: [
            {
                query: "ion-input",
                root: "parent",
                variables: [
                    {
                        variable: "--color",
                        set: "var(--ion-color-danger)",
                        unset: "var(--ion-color)"
                    }
                ]
            },
            {
                query: "",
                root: "parent",
                variables: [
                    {
                        variable: "--border-color",
                        set: "var(--ion-color-danger)",
                        unset: ""
                    }
                ]
            }
        ]
    }
}

/**
 * Maps prop names to their custom validation
 * @param {string} prop
 * @param {*} value
 * @returns {string|undefined} undefined if ok, the error otherwise
 * @memberOf Validations
 */
const propToError = function(prop, value){
    switch (prop){
        case SUB_TYPES.TIN:
            return tinHasErrors(value);
        default:
            break;
    }
}

/**
 * Does the match between the Browser's Validity state and the validators/type
 * @type {{tooShort: string, typeMismatch: string, stepMismatch: string, rangeOverFlow: string, badInput: undefined, customError: undefined, tooLong: string, patternMismatch: string, rangeUnderFlow: string, valueMissing: string}}
 * @memberOf Validations
 */
const ValidityStateMatcher = {
    patternMismatch: "pattern",
    rangeOverFlow: "max",
    rangeUnderFlow: "min",
    stepMismatch: "step",
    tooLong: "maxlength",
    tooShort: "minlength",
    typeMismatch: "email|URL",
    valueMissing: "required"
}

/**
 * Returns
 * @return {*}
 * @constructor
 * @memberOf Validations
 */
const ValidatorRegistry = function(...initial){
    const registry =  new function(){
        const registry = {};

        /**
         *
         * @param validator
         * @memberOf ValidatorRegistry
         */
        this.register = function(...validator){
            validator.forEach(v => {
                const instance = new v();
                registry[instance.name] = v;
            });
        }

        /**
         *
         * @param name
         * @return {*}
         * @memberOf ValidatorRegistry
         */
        this.getValidator = function(name){
            if (!(name in registry))
                return;
            return registry[name];
        }

        /**
         * does the matching between the fields validity params and the field's properties (type/subtype)
         * @param [validityState]
         * @return {*}
         * @memberOf ValidatorRegistry
         */
        this.matchValidityState = function(validityState = ValidityStateMatcher){
            if (typeof validityState === 'string'){
                if (!(validityState in ValidityStateMatcher))
                    return;
                return ValidityStateMatcher[validityState];
            } else {
                const result = {};
                for(let prop in validityState)
                    if (prop in ValidityStateMatcher)
                        result[ValidityStateMatcher[prop]] = validityState[prop];
                return result;
            }
        }
    }()
    registry.register(...initial);
    return registry;
}

/**
 * Handles validations
 * @class Validator
 * @abstract
 * @memberOf Validations
 */
class Validator {
    /**
     * @param {string} name validator name. Should match the type -> subtype of the field
     * @param {string} [errorMessage] should always have a default message
     * @constructor
     */
    constructor(name, errorMessage= "Child classes must implement this"){
        this.name = name;
        this.errorMessage = errorMessage;
    }
    /**
     * returns the error message, or nothing if is valid
     * @param value the value
     * @param [args] optional others args
     * @return {string | undefined} errors or nothing
     */
    hasErrors(value, ...args){
        return this.errorMessage;
    }
}

/**
 * Validates a pattern
 * @param {string} text
 * @param {RegExp} pattern in the '//' notation
 * @returns {string|undefined} undefined if ok, the error otherwise
 * @memberOf Validations
 * @return {string | undefined}
 */
const patternHasErrors = function(text, pattern){
    if (!text) return;
    if (!pattern.test(text))
        return "Field does not match pattern";
}

/**
 * Handles Pattern validations
 * @class PatternValidator
 * @extends Validator
 * @memberOf Validations
 */
class PatternValidator extends Validator {
    /**
     * @param {string} errorMessage
     * @constructor
     */
    constructor(errorMessage = "Field does not match pattern") {
        super("pattern", errorMessage);
    }

    /**
     * returns the error message, or nothing if is valid
     * @param value the value
     * @param pattern the pattern to validate
     * @return {string | undefined} the errors or nothing
     */
    hasErrors(value, pattern){
        return patternHasErrors(value, pattern);
    }
}

const emailPattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

/**
 * @param {string} email
 * @returns {string|undefined} undefined if ok, the error otherwise
 * @memberOf Validations
 */
const emailHasErrors = function(email){
    if (patternHasErrors(email, emailPattern))
        return "Invalid email";
}

/**
 * Handles email validations
 * @class EmailValidator
 * @extends Validator
 * @memberOf Validations
 */
class EmailValidator extends Validator {
    /**
     * @param {string} errorMessage
     * @constructor
     */
    constructor(errorMessage = "That is not a valid email") {
        super("email", errorMessage);

    }

    /**
     * returns the error message, or nothing if is valid
     * @param value the value
     * @return {string | undefined} the errors or nothing
     */
    hasErrors(value){
        return patternHasErrors(value, emailPattern);
    }
}

/**
 * Validates a tin number
 * @param {string|number} tin
 * @returns {string|undefined} undefined if ok, the error otherwise
 * @memberOf Validations
 */
const tinHasErrors = function(tin){
    if (!tin) return;
    tin = tin + '';
    if (patternHasErrors(tin,))
        return "Not a valid Tin";
}

/**
 * Handles email validations
 * @class TinValidator
 * @extends Validator
 * @memberOf Validations
 */
class TinValidator extends Validator {
    /**
     * @param {string} errorMessage
     * @constructor
     */
    constructor(errorMessage = "That is not a valid Tin") {
        super("tin", errorMessage);
    }

    /**
     * returns the error message, or nothing if is valid
     * @param value the value
     * @return {string | undefined} the errors or nothing
     */
    hasErrors(value){
        return patternHasErrors(value, /^\d{9}$/);
    }
}

/**
 * Validates a number Field (only integers supported)
 * @param {number} value
 * @param props
 * @memberOf Validations
 */
const numberHasErrors = function(value, props){
    if (props[ION_CONST.name_key] === SUB_TYPES.TIN)
        return tinHasErrors(value);
    let {max, min} = props;
    if (value > max)
        return `The maximum is ${max}`;
    if (value < min)
        return `The minimum is ${min}`;
}

/**
 * Validates a date value
 * @param {Date} date
 * @param props
 * @memberOf Validations
 */
const dateHasErrors = function(date, props){
    throw new Error("Not implemented date validation");
}

/**
 * Validates a text value
 * @param {string} text
 * @param props
 * @memberOf Validations
 */
const textHasErrors = function(text, props){
    if (props[ION_CONST.name_key] === SUB_TYPES.TIN)
        return tinHasErrors(text);
}

/**
 * parses the numeric values
 * @param props
 * @memberOf Validations
 */
const parseNumeric = function(props){
    let prop;
    try{
        for (prop in props)
            if (props.hasOwnProperty(prop) && props[prop])
                if ([ION_CONST.max_length, ION_CONST.max_value, ION_CONST.min_length, ION_CONST.min_value].indexOf(prop) !== -1)
                    props[prop] = parseInt(props[prop]);
    } catch (e){
        throw new Error(`Could not parse numeric validations attributes for field ${props.name} prop: ${prop}`);
    }
    return props;
}

/**
 * Parses the supported attributes in the element
 * @param {HTMLElement} element
 * @return the object of existing supported attributes
 * @memberOf Validations
 */
const getValidationAttributes = function(element){
    return {
        type: element[ION_CONST.type_key],
        name: element[ION_CONST.name_key],
        required: element[ION_CONST.required_key],
        max: element[ION_CONST.max_value],
        maxlength: element[ION_CONST.max_length],
        min: element[ION_CONST.min_value],
        minlength: element[ION_CONST.min_length]
    };
}

/**
 * Validates a ion-input element for required & max/min length.
 * @param {HTMLElement} element
 * @param {object} props
 * @returns {string|undefined} undefined if ok, the error otherwise
 * @memberOf Validations
 */
const hasRequiredAndLengthErrors = function(element, props){
    let {required, maxLength, minLength} = props;
    let value = element.value;
    value = value && typeof value === 'string' ? value.trim() : value;
    if (required && !value)
        return "Field is required";
    if (!value) return;
    if (minLength && value.length < minLength)
        return `The minimum length is ${minLength}`;
    if (maxLength && value.length > maxLength)
        return `The maximum length is ${minLength}`;
}

/**
 *
 * @param props
 * @param prefix
 * @return {boolean}
 * @memberOf Validations
 */
const testInputEligibility = function(props, prefix){
    return !(!props[ION_CONST.name_key] || !props[ION_CONST.type_key] || props[ION_CONST.name_key].indexOf(prefix) === -1);
}

/**
 * Test a specific type of Ionic input field for errors
 *
 * should (+/-) match the ion-input type property
 *
 * supported types:
 *  - email;
 *  - tin
 *  - text
 *  - number
 *
 * @param {HTMLElement} element the ion-input field
 * @param {string} prefix the prefix for the ion-input to be validated
 * @memberOf Validations
 */
const hasIonErrors = function(element, prefix){
    let props = getValidationAttributes(element);
    if (!testInputEligibility(props, prefix))
        throw new Error(`input field ${element} with props ${props} does not meet criteria for validation`);
    props[ION_CONST.name_key] = props[ION_CONST.name_key].substring(prefix.length);
    let errors = hasRequiredAndLengthErrors(element, props);
    if (errors)
        return errors;

    let value = element.value;
    switch (props[ION_CONST.type_key]){
        case ION_TYPES.EMAIL:
            errors = emailHasErrors(value);
            break;
        case ION_TYPES.DATE:
            errors = dateHasErrors(value, props);
            break;
        case ION_TYPES.NUMBER:
            props = parseNumeric(props);
            errors = numberHasErrors(value, props);
            break;
        case ION_TYPES.TEXT:
            errors = textHasErrors(value, props);
            break;
        default:
            errors = undefined;
    }

    return errors;
}

/**
 * Until I get 2way data binding to work on ionic components, this solves it.
 *
 * It validates the fields via their ion-input supported properties for easy integration if they ever work natively
 *
 * If the input's value has changed, an event called 'input-has-changed' with the input name as data
 *
 * @param {WebcController} controller
 * @param {HTMLElement} element the ion-input element
 * @param {string} prefix prefix to the name of the input elements
 * @param {boolean} [force] defaults to false. if true ignores if the value changed or not
 * @returns {string|undefined} undefined if ok, the error otherwise
 * @memberOf Validations
 */
const updateModelAndGetErrors = function(controller, element, prefix, force){
    force = !!force || false;
    if (!controller.model)
        return;
    let name = element.name.substring(prefix.length);
    if (typeof controller.model[name] === 'object') {
        let valueChanged = (controller.model[name].value === undefined && !!element.value)
            || (!!controller.model[name].value && controller.model[name].value !== element.value);

        controller.model[name].value = element.value;
        if (valueChanged || force){
            const hasErrors = hasIonErrors(element, prefix);
            controller.model[name].error = hasErrors;
            updateStyleVariables(controller, element, hasErrors);
            controller.send('input-has-changed', name);
            return hasErrors;
        }
        return controller.model[name].error;
    }
}

/**
 * Manages the inclusion/exclusion of the error variables according to {@link ION_CONST#error#variables} in the element according to the selected {@link ION_CONST#error#append}
 * @param {WebcController} controller
 * @param {HTMLElement} element
 * @param {string} hasErrors
 * @memberOf Validations
 */
const updateStyleVariables = function(controller, element, hasErrors){
    let el, selected, q;
    const getRoot = function(root) {
        let elem;
        switch (root) {
            case QUERY_ROOTS.parent:
                elem = element.parentElement;
                break;
            case QUERY_ROOTS.self:
                elem = element;
                break;
            case QUERY_ROOTS.controller:
                elem = controller.element;
                break;
            default:
                throw new Error("Unsupported Error style strategy");
        }
        return elem;
    }
    const queries = ION_CONST.error.queries;

    queries.forEach(query => {
        q = query.query.replace('${name}', element.name);
        el = getRoot(query.root);
        selected = q ? el.querySelectorAll(q) : [el];
        selected.forEach(s => {
            query.variables.forEach(v => {
                s.style.setProperty(v.variable, hasErrors ? v.set : v.unset)
            });
        });
    });
}

/**
 * iterates through all supported inputs and calls {@link updateModelAndGetErrors} on each.
 *
 * sends controller validation event
 * @param {WebcController} controller
 * @param {string} prefix
 * @return {boolean} if there are any errors in the model
 * @param {boolean} force (Decides if forces the validation to happen even if fields havent changed)
 * @memberOf Validations
 */
const controllerHasErrors = function(controller, prefix, force){
    let inputs = controller.element.querySelectorAll(`${ION_CONST.input_tag}[name^="${prefix}"]`);
    let errors = [];
    let error;
    inputs.forEach(el => {
        error = updateModelAndGetErrors(controller, el, prefix, force);
        if (error)
            errors.push(error);
    });
    let hasErrors = errors.length > 0;
    controller.send(hasErrors ? 'ion-model-is-invalid' : 'ion-model-is-valid');
    return hasErrors;
}

/**
 * When using ionic input components, this binds the controller for validation purposes.
 *
 * Inputs to be eligible for validation need to be named '${prefix}${propName}' where the propName must
 * match the type param in {@link hasErrors} via {@link updateModelAndGetErrors}
 *
 * Gives access to the validateIonic method on the controller via:
 * <pre>
 *     controller.hasErrors();
 * </pre>
 * (returns true or false)
 *
 * where all the inputs are validated
 *
 * @param {WebcController} controller
 * @param {function()} [onValidModel] the function to be called when the whole Controller model is valid
 * @param {function()} [onInvalidModel] the function to be called when any part of the model is invalid
 * @param {string} [prefix] the prefix for the ion-input to be validated. defaults to 'input-'
 * @memberOf Validations
 */
const bindIonicValidation = function(controller, onValidModel, onInvalidModel, prefix){
    if (typeof onInvalidModel === 'string' || !onInvalidModel){
        prefix = onInvalidModel
        onInvalidModel = () => {
            const submitButton = controller.element.querySelector('ion-button[type="submit"]');
            if (submitButton)
                submitButton.disabled = true;
        }
    }
    if (typeof onValidModel === 'string' || !onValidModel){
        prefix = onValidModel
        onValidModel = () => {
            const submitButton = controller.element.querySelector('ion-button[type="submit"]');
            if (submitButton)
                submitButton.disabled = false;
        }
    }

    prefix = prefix || 'input-';
    controller.on('ionChange', (evt) => {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        let element = evt.target;
        if (!element.name) return;
        let errors = updateModelAndGetErrors(controller, element, prefix);
        if (errors)     // one fails, all fail
            controller.send('ion-model-is-invalid');
        else            // Now we have to check all of them
            controllerHasErrors(controller, prefix);
    });

    controller.hasErrors = (force) => controllerHasErrors(controller, prefix, force);

    controller.on('ion-model-is-valid', (evt) => {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        if (onValidModel)
            onValidModel.apply(controller);
    });

    controller.on('ion-model-is-invalid', (evt) => {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        if (onInvalidModel)
            onInvalidModel.apply(controller);
    });

    controller.on('input-has-changed', _handleErrorElement.bind(controller));
}

/**
 *
 * @param evt
 * @private
 * @memberOf Validations
 */
const _handleErrorElement = function(evt){
    let name = evt.detail;
    let attributes = this.model.toObject()[name];
    let errorEl = this.element.querySelector(`ion-note[name="note-${name}"]`);
    if (attributes.error){
        if (errorEl){
            errorEl.innerHTML = attributes.error;
        } else {
            errorEl = document.createElement('ion-note');
            errorEl.setAttribute('position', 'stacked');
            errorEl.setAttribute('slot', 'end');
            errorEl.setAttribute('color', 'danger');
            errorEl.setAttribute('name', `note-${name}`)
            errorEl.innerHTML = attributes.error;
            let htmlEl = this.element.querySelector(`ion-item ion-input[name="input-${name}"]`);
            htmlEl.insertAdjacentElement('afterend', errorEl);
        }
    } else if (errorEl) {
        errorEl.remove();
    }
}

/**
 * Validates a Model element according to prop names
 * *Does not validate 'required' or more complex attributes yet*
 * TODO use annotations to accomplish that
 * @returns {string|undefined} undefined if ok, the error otherwise
 * @memberOf Validations
 */
const modelHasErrors = function(model){
    let error;
    for (let prop in model)
        if (model.hasOwnProperty(prop)){
            if (prop in Object.values(ION_TYPES) || prop in Object.values(SUB_TYPES))
                error = propToError(prop, model[prop]);
            if (error)
                return error;
        }
}

/**
 * Provides the implementation for the Model to be validatable alongside Ionic components
 * via the {@link hasErrors} method
 * @interface
 * @memberOf Validations
 */
class Validatable{
    /**
     * @see {modelHasErrors}
     */
    hasErrors(){
        return modelHasErrors(this);
    }
}

module.exports = {
    Validatable,
    Validators: {
        Validator: Validator,
        Validators: {
            TinValidator: TinValidator,
            EmailValidator: EmailValidator,
            PatternValidator: PatternValidator
        },
        ValidityStateMatcher: ValidityStateMatcher,
        Registry: ValidatorRegistry(TinValidator, EmailValidator, PatternValidator)
    },
    bindIonicValidation,
    emailHasErrors,
    tinHasErrors,
    textHasErrors,
    numberHasErrors,
    hasIonErrors
};
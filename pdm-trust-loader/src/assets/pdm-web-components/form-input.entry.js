import { r as registerInstance, h, f as Host, g as getElement } from './index-d0e12a29.js';
import { H as HostElement } from './index-3dd6e8f7.js';
import { w as wizard } from './WizardService-2f7a45ff.js';

const { Registry: Registry$1, Validator, Validators } = wizard.Model.Validations.Validators;
const { INPUT_FIELD_PREFIX: INPUT_FIELD_PREFIX$1 } = wizard.Constants;
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
  hasErrors(value, fieldName) {
    const el = document.body.querySelector(`input[name="${INPUT_FIELD_PREFIX$1}${fieldName}"]`);
    if (!el)
      return console.log(`Could not find field ${fieldName} to perform equality validation. Assuming valid`);
    if (el.value !== value)
      return this.errorMessage;
  }
}
Registry$1.register(EqualityValidator);
const ValidationService = {
  Registry: Registry$1,
  Validators: Object.assign({}, Validators, {
    EqualityValidator: EqualityValidator
  }),
  INPUT_FIELD_PREFIX: INPUT_FIELD_PREFIX$1
};

const formInputCss = ":host{display:block}ion-item.form-input-invalid{}ion-item.form-input-invalid>ion-label{--color:var(--ion-color-danger-shade)}";

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const { Registry, INPUT_FIELD_PREFIX } = ValidationService;
const ERROR_CSS_CLASS = "form-input-invalid";
const FormInput = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.input = undefined;
    this.inputPrefix = INPUT_FIELD_PREFIX;
    this.lines = 'inset';
    this.labelPosition = 'floating';
    this.cssClassString = '';
    this.customValidation = false;
    this.hasErrors = false;
    this.ionEl = undefined;
    this.baseEl = undefined;
    this.validators = undefined;
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }
  async componentDidRender() {
    this.baseEl = this.element.querySelector(`input[name="${this.getInputName()}"]`);
    if (this.input)
      this.ionEl = this.element.querySelector(`${this.input.element}`);
    if (this.baseEl)
      this.bindInput(this.baseEl);
  }
  createErrorMessage(invalids) {
    return Object.keys(invalids).reduce((accum, i) => {
      if (!(i in this.input.validation))
        return accum;
      accum.push(this.input.validation[i].error);
      return accum;
    }, []).join('\n');
  }
  checkMessageTranslations(customValidity) {
    const invalids = Object.keys(customValidity).reduce((accum, key) => {
      if (customValidity[key]) {
        // @ts-ignore
        accum = accum || {};
        accum[key] = customValidity[key];
      }
      return accum;
    }, undefined);
    if (invalids)
      return this.createErrorMessage(invalids);
    console.log(`Field is valid`);
  }
  /**
   * Instantiates the necessary custom validators (the ones with an 'args' param)
   * @param {HTMLFormInputElement} element
   * @private
   */
  bindValidators(element) {
    if (!this.input.validation && !element['subtype'])
      return console.log(`No custom validators defined for ${element.name}`);
    const neededValidators = new Set();
    if (element['subtype'])
      neededValidators.add(element.subtype);
    Object.keys(this.input.validation).reduce((accum, key) => {
      if (!(key in this.input.validation) && key !== element['subtype'])
        return accum;
      if (!this.input.validation[key].args) // validator is not meant to be executed. just has the custom error message
        return accum;
      accum.add(key);
      return accum;
    }, neededValidators).forEach(key => {
      this.validators = this.validators || {};
      try {
        this.validators[key] = new (Registry.getValidator(key))(this.input.validation[key].error);
        console.log(`New validator ${key} instanced and attached to ${element.name}`);
      }
      catch (e) {
        console.log(`Could not retrieve instance of ${key} Validator on Field ${element.name}. skipping...`);
      }
    });
  }
  performValidations(element, report = false) {
    const self = this;
    this.hasErrors = !element.validity.valid;
    let customValidity = Registry.matchValidityState(element.validity);
    console.log(`Custom validity matching for ${element.name}: ${customValidity}`);
    const performCustomValidations = function (customValidity) {
      return Object.keys(self.validators).reduce((accum, key) => {
        const error = self.validators[key].hasErrors(self.ionEl.value, ...self.input.validation[key].args);
        accum[key] = !!error;
        return accum;
      }, customValidity);
    };
    if (this.validators && this.customValidation) {
      customValidity = performCustomValidations(customValidity);
      console.log(`Custom validity updated with custom validators for ${element.name}: ${customValidity}`);
    }
    const errors = this.checkMessageTranslations(customValidity);
    if (errors) {
      console.log(`Errors found: ${errors}`);
      this.hasErrors = true;
      element.setCustomValidity(errors);
    }
    if (report)
      element.reportValidity();
    return this.hasErrors;
  }
  bindInput(element) {
    const self = this;
    if (this.customValidation)
      self.bindValidators(element);
    element.oninvalid = self.onInvalid.bind(self);
    element.onvalid = (e) => console.log('VALID:', e);
  }
  update(newVal) {
    console.log(newVal);
  }
  onChange(evt) {
    this.input.props.value = evt.detail.value;
    //this.performValidations(evt.target.querySelector('input'), false);
  }
  onInput(evt) {
    console.log("input", evt);
    this.hasErrors = false;
    this.baseEl.setCustomValidity('');
  }
  onInvalid(evt) {
    console.log("INPUT INVALID", evt);
    this.performValidations(this.baseEl, false);
  }
  isReady() {
    return this.input && this.input.name;
  }
  getInputName() {
    return `${this.inputPrefix}${this.input.name}`;
  }
  renderInput() {
    const self = this;
    const getLabel = function () {
      if (!self.isReady())
        return (h("ion-skeleton-text", { style: {
            "width": "60%"
          }, animated: true }));
      return self.input.label;
    };
    const getInput = function () {
      if (!self.isReady())
        return (h("ion-skeleton-text", { style: {
            "width": "85%"
          }, animated: true }));
      const Tag = self.input.element;
      return (h(Tag, Object.assign({ name: self.getInputName() }, self.input.props, { onIonChange: self.onChange.bind(self), onIonInput: self.onInput.bind(self) })));
    };
    return [
      h("ion-label", { position: this.labelPosition }, getLabel()),
      getInput()
    ];
  }
  renderClassString() {
    return (typeof this.cssClassString === 'string' ? this.cssClassString : this.cssClassString.join(' ')) +
      this.hasErrors ? ` ${ERROR_CSS_CLASS}` : '';
  }
  render() {
    if (!this.host.isConnected)
      return;
    return (h(Host, null, h("ion-item", { lines: this.lines, class: this.renderClassString() }, this.renderInput())));
  }
  get element() { return getElement(this); }
  static get watchers() { return {
    "input": ["update"]
  }; }
};
__decorate([
  HostElement()
], FormInput.prototype, "host", void 0);
FormInput.style = formInputCss;

export { FormInput as form_input };

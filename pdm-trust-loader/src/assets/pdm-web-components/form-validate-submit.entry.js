import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-21b82b33.js';
import { H as HostElement } from './index-993dbba1.js';
import { S as SUPPORTED_LOADERS } from './supported-loader-4cd02ac2.js';

const formValidateSubmitCss = ":host{display:block}";

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
const INPUT_SELECTOR = "ion-input ion-select ion-text-area ion-range ion-datetime";
const FormValidateSubmit = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendErrorEvent = createEvent(this, "ssapp-send-error", 7);
    this.sendNavigateTab = createEvent(this, "ssapp-navigate-tab", 7);
    this.sendCreateAction = createEvent(this, "ssapp-action", 7);
    this.formJSON = '{}';
    this.loaderType = SUPPORTED_LOADERS.circles;
    this.lines = 'inset';
    this.labelPosition = 'floating';
    this.customValidation = false;
    this.form = undefined;
  }
  async updateForm(newVal) {
    if (newVal.startsWith('@'))
      return;
    this.form = JSON.parse(newVal);
    console.log(this.form);
  }
  onReset(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.element.querySelectorAll(INPUT_SELECTOR).forEach(input => input.value = '');
  }
  onSubmit(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    console.log(evt);
  }
  getLoading() {
    return (h("div", { class: "flex ion-padding-horizontal ion-align-items-center ion-justify-content-center" }, h("multi-spinner", { type: this.loaderType })));
  }
  getButtons() {
    if (!this.form)
      return;
    return (h("div", { class: "ion-text-end ion-padding-vertical ion-margin-top" }, h("slot", { name: "buttons" })));
  }
  getForm() {
    if (!this.form)
      return (h("slot", { name: "fields" }));
    return this.form.fields.map(field => h("form-input", { input: field, "enable-custom-validation": this.customValidation, prefix: this.form.prefix, lines: this.lines, "label-position": this.labelPosition }));
  }
  render() {
    return (h(Host, null, h("ion-card", null, h("ion-card-header", { class: "ion-margin ion-padding-horizontal" }, h("div", null, h("slot", { name: "header" }))), h("ion-card-content", null, h("form", { id: "form-validate-submit", onSubmit: this.onSubmit.bind(this), onReset: this.onReset.bind(this) }, this.getForm(), this.getButtons())))));
  }
  get element() { return getElement(this); }
  static get watchers() { return {
    "formJSON": ["updateForm"]
  }; }
};
__decorate([
  HostElement()
], FormValidateSubmit.prototype, "host", void 0);
FormValidateSubmit.style = formValidateSubmitCss;

export { FormValidateSubmit as form_validate_submit };

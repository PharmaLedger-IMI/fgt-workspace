import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-21b82b33.js';
import { H as HostElement } from './index-993dbba1.js';
import { w as wizard } from './WizardService-c618738b.js';

const formInputCss = ":host{display:block}";

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
const { Validations } = wizard.Model;
const { INPUT_FIELD_PREFIX } = wizard.Constants;
const FormInput = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendErrorEvent = createEvent(this, "ssapp-send-error", 7);
    this.sendCreateAction = createEvent(this, "ssapp-action", 7);
    this.input = undefined;
    this.inputPrefix = INPUT_FIELD_PREFIX;
    this.lines = 'inset';
    this.labelPosition = 'floating';
    this.cssClass = '';
  }
  sendError(message, err) {
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Product Component: ${message}`, err);
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }
  update(newVal) {
    console.log(newVal);
  }
  isReady() {
    return this.input && this.input.name;
  }
  getInputName() {
    return `${this.inputPrefix}${this.input.name}`;
  }
  // @ts-ignore
  getInput() {
    if (!this.isReady())
      return undefined;
    return this.element.querySelector(`${this.input.element}[name="${this.getInputName()}"]`);
  }
  renderInput() {
    const self = this;
    const getLabel = function () {
      if (!self.input || !self.input.name)
        return (h("ion-skeleton-text", { style: {
            "width": "60%"
          }, animated: true }));
      return self.input.label;
    };
    const getInput = function () {
      if (!self.input || !self.input.name)
        return (h("ion-skeleton-text", { style: {
            "width": "85%"
          }, animated: true }));
      const Tag = self.input.element;
      return (h(Tag, Object.assign({ name: self.input.name }, self.input.props)));
    };
    return [
      h("ion-label", { position: this.labelPosition }, getLabel()),
      getInput()
    ];
  }
  render() {
    if (!this.host.isConnected)
      return;
    return (h(Host, null, h("ion-item", { lines: this.lines, class: typeof this.cssClass === 'string' ? this.cssClass : this.cssClass.join(' ') }, this.renderInput())));
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

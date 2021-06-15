import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-21b82b33.js';
import { H as HostElement } from './index-993dbba1.js';
import { w as wizard } from './WizardService-c618738b.js';

const createManageViewLayoutCss = ":host{display:block}";

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
const { INPUT_FIELD_PREFIX } = wizard.Constants;
const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'];
const CreateManageViewLayout = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.createEvent = createEvent(this, "createEvent", 7);
    this.goBackEvent = createEvent(this, "goBackEvent", 7);
    this.isCreate = true;
    this.breakpoint = "lg-4-3";
    // strings
    this.createTitleString = "Create String";
    this.manageTitleString = "Manage String";
    this.backString = "Back";
    this.createString = "Create";
    this.clearString = "Clear";
    this.iconName = "grid";
  }
  async componentDidRender() {
    this.updateSlotsOnIsCreateChange(this.isCreate);
  }
  parseBreakPoint() {
    let breakpoint = this.breakpoint;
    if (!breakpoint || !breakpoint.match(`^(?:${breakpoints.join("|")})(?:-(?:[2-9]|1[0-2]?))+$`)) {
      console.log(`Invalid breakpoint definition. reverting to default 'lg-4-3'`);
      breakpoint = 'lg-4-3';
    }
    let splitBreakpoint = breakpoint.split('-');
    return {
      break: splitBreakpoint.shift(),
      sizes: splitBreakpoint.map(b => parseInt(b))
    };
  }
  generateSizeProps(reverse = false) {
    const props = {};
    const parsedBreakpoint = Object.assign({}, this.parseBreakPoint());
    let position;
    breakpoints.every((b, i) => {
      if (b !== parsedBreakpoint.break && !position)
        return true;
      if (!position)
        position = i;
      const bp = parsedBreakpoint.sizes.shift();
      if (!bp)
        return false;
      props[`size-${breakpoints[i]}`] = '' + (reverse ? 12 - bp : bp);
    });
  }
  goBack(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.goBackEvent.emit();
  }
  create(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.createEvent.emit(this.produceFormResult());
  }
  reset(evt) {
    if (evt) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
    }
    const formInputs = this.getIonInputs();
    const notDisabledInputs = Array.prototype.filter.call(formInputs, (e) => !e.disabled);
    notDisabledInputs.forEach(input => input.value = '');
  }
  produceFormResult() {
    const applicableFields = Array.prototype.filter.call(this.getIonInputs(), (input) => input.name.startsWith(INPUT_FIELD_PREFIX));
    return this.extractFormResults(applicableFields);
  }
  extractFormResults(inputs) {
    return Array.prototype.reduce.call(inputs, (accum, input) => {
      accum[input.name.substring(INPUT_FIELD_PREFIX.length)] = input.value;
      return accum;
    }, {});
  }
  getIonInputs() {
    return this.element.querySelector('form').querySelectorAll('ion-input, ion-textarea, ion-range, ion-checkbox, ion-radio, ion-select');
  }
  getHeader() {
    return [
      h("div", { class: "flex ion-align-items-center" }, h("ion-icon", { name: "layers", size: "large", color: "medium" }), h("ion-label", { class: "ion-text-uppercase ion-padding-start", color: "secondary" }, this.isCreate ? this.createTitleString : this.manageTitleString)),
      h("ion-row", { class: "ion-align-items-center" }, h("ion-button", { color: "secondary", fill: "clear", class: "ion-margin-start", onClick: this.goBack.bind(this) }, h("ion-icon", { slot: "start", name: "return-up-back", class: "ion-margin-end" }), this.backString))
    ];
  }
  getCreateToolbar() {
    return [
      h("ion-button", { type: "reset", color: "medium", fill: "clear", class: "ion-margin-start" }, this.clearString),
      h("ion-button", { type: "submit", color: "secondary", class: "ion-margin-start" }, this.createString, h("ion-icon", { slot: "end", name: "add-circle", class: "ion-margin-start" }))
    ];
  }
  getCreate() {
    const self = this;
    const getCreateContent = function () {
      return [
        h("slot", { name: "create" }, "This is the default create content"),
        h("div", { class: "ion-text-end ion-padding-vertical ion-margin-top" }, self.getCreateToolbar())
      ];
    };
    return (h("form", { onSubmit: (e) => this.create(e), onReset: (e) => this.reset(e) }, h("div", null, getCreateContent())));
  }
  updateSlotsOnIsCreateChange(newVal) {
    if (typeof newVal !== 'boolean')
      return;
    const selector = newVal ? 'div[slot="create"]' : 'div[slot="postcreate"], div[slot="manage"]';
    const slots = this.element.querySelectorAll(selector);
    if (slots)
      slots.forEach(s => s.hidden = false);
    if (newVal)
      this.reset();
  }
  async getInput(name) {
    const inputEl = this.element.querySelector(`form input[name="${INPUT_FIELD_PREFIX}${name}"]`) || this.element.querySelector(`input[name="${INPUT_FIELD_PREFIX}${name}"]`);
    return inputEl.closest('ion-input');
  }
  async clear() {
    const clearButtonEl = this.element.querySelector(`form ion-button[type="clear"]`);
    clearButtonEl.click();
  }
  getManageContent() {
    const getPostCreateContent = function () {
      return h("slot", { name: "postcreate" }, "This is the default post create content");
    };
    const getManageContent = function () {
      return h("slot", { name: "manage" }, "This is a default manage content");
    };
    return [
      h("ion-grid", null, h("ion-row", null, h("ion-col", Object.assign({ size: "12" }, this.generateSizeProps()), h("div", null, getPostCreateContent())), h("ion-col", Object.assign({ size: "12" }, this.generateSizeProps(true)), h("div", null, getManageContent()))))
    ];
  }
  getContent() {
    if (this.isCreate)
      return this.getCreate();
    return this.getManageContent();
  }
  render() {
    if (!this.host.isConnected)
      return;
    return (h(Host, null, h("div", { class: "ion-margin-bottom ion-padding-horizontal" }, h("ion-row", { class: "ion-align-items-center ion-justify-content-between" }, this.getHeader())), h("ion-card", { class: "ion-padding" }, this.getContent())));
  }
  get element() { return getElement(this); }
};
__decorate([
  HostElement()
], CreateManageViewLayout.prototype, "host", void 0);
CreateManageViewLayout.style = createManageViewLayoutCss;

export { CreateManageViewLayout as create_manage_view_layout };

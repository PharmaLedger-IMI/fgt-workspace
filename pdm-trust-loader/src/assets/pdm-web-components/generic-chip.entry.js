import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-d0e12a29.js';
import { H as HostElement } from './index-3dd6e8f7.js';

const genericChipCss = ":host{display:inherit}generic-chip{--color-step:var(--ion-color-primary);--color-step-rgba:rgba(var(--color-step), 0.10);--color-step-0:#c70000;--color-step-5:#c0070d;--color-step-10:#ba0e1a;--color-step-15:#b31526;--color-step-20:#ac1c33;--color-step-25:#a62340;--color-step-30:#9f2a4d;--color-step-35:#983159;--color-step-40:#923866;--color-step-45:#8b3f73;--color-step-50:#854680;--color-step-55:#7e4d8c;--color-step-60:#775499;--color-step-65:#715ba6;--color-step-70:#6a62b3;--color-step-75:#6369bf;--color-step-80:#5d70cc;--color-step-85:#5677d9;--color-step-90:#4f7ee6;--color-step-95:#4985f2;--color-step-100:var(--ion-color-primary)}generic-chip ion-badge{background-color:var(--color-step)}generic-chip ion-chip{animation:500ms linear fadein}generic-chip div.badges-div{display:flex}generic-chip div.badges-div>*:not(:first-child){margin-left:var(--ion-margin, 16px)}generic-chip div.button-div{display:flex}generic-chip div.button-div>*{display:none}generic-chip div.button-div>*:not(:first-child){margin-left:calc(var(--ion-margin, 16px)/2)}generic-chip:hover div.button-div>*{display:block;animation:400ms ease-in-out fadein}@keyframes fadein{from{opacity:0}to{opacity:1}}";

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
const GenericChip = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.selectEvent = createEvent(this, "selectEvent", 3);
    this.chipLabel = undefined;
    this.outline = true;
    this.color = "secondary";
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }
  triggerSelect() {
    this.selectEvent.emit(this.chipLabel);
  }
  render() {
    return (h(Host, null, h("ion-chip", { outline: this.outline, color: this.color, onClick: () => this.triggerSelect() }, h("ion-label", { class: "ion-padding-horizontal" }, this.chipLabel), h("div", { class: "badges-div ion-align-items-center ion-justify-content-between" }, h("slot", { name: "badges" })), h("div", { class: "button-div ion-align-items-center ion-justify-content-between" }, h("slot", { name: "buttons" })))));
  }
  get element() { return getElement(this); }
};
__decorate([
  HostElement()
], GenericChip.prototype, "host", void 0);
GenericChip.style = genericChipCss;

export { GenericChip as generic_chip };

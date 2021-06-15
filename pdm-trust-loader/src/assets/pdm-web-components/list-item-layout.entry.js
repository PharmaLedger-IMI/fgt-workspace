import { r as registerInstance, h, f as Host, g as getElement } from './index-21b82b33.js';
import { H as HostElement } from './index-993dbba1.js';
import { i as ionBreakpoints, b as bindIonicBreakpoint } from './utilFunctions-a21afb00.js';

const listItemLayoutCss = ":host{display:block}";

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
const ListItemLayout = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.cssClass = "ion-margin-bottom";
    this.adjustmentClass = "ion-justify-content-end";
    this.lines = "none";
    this.color = "light";
    this.currentBreakpoint = ionBreakpoints.lg + '';
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }
  async componentDidLoad() {
    const self = this;
    this.currentBreakpoint = bindIonicBreakpoint(bp => self.currentBreakpoint = bp) + '';
    this.getSlotted();
  }
  getSlotted() {
    let slotted = this.element.children;
    this.children = { hasChildren: slotted && slotted.length > 0, numberOfChildren: slotted && slotted.length };
  }
  getAdjustment() {
    switch (this.currentBreakpoint + '') {
      case 'xs':
      case 'sm':
      case 'md':
        return "ion-justify-content-start ion-margin-vertical";
      case 'lg':
      case 'xl':
      default:
        return "ion-justify-content-end";
    }
  }
  render() {
    if (!this.host.isConnected)
      return;
    return (h(Host, null, h("ion-item", { class: `main-item${this.cssClass ? this.cssClass : ''}`, lines: this.lines, color: this.color }, h("div", { slot: "start" }, h("slot", { name: "start" })), h("ion-grid", null, h("ion-row", null, h("ion-col", { size: "12", "size-lg": "5" }, h("div", null, h("slot", { name: "label" }))), h("ion-col", { size: "12", "size-lg": "7" }, h("div", { class: `flex ${this.getAdjustment()}` }, h("slot", { name: "content" }))))), h("div", { slot: "end" }, h("slot", { name: "buttons" })))));
  }
  get element() { return getElement(this); }
};
__decorate([
  HostElement()
], ListItemLayout.prototype, "host", void 0);
ListItemLayout.style = listItemLayoutCss;

export { ListItemLayout as list_item_layout };

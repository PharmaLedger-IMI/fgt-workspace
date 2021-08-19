import { r as registerInstance, h, f as Host, g as getElement } from './index-d0e12a29.js';
import { H as HostElement } from './index-3dd6e8f7.js';
import { i as ionBreakpoints, c as calcBreakPoint } from './utilFunctions-e534eb9e.js';

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
    this.orientation = "end";
    this.lines = "none";
    this.color = "light";
    this.labelCol = 4;
    this.currentBreakpoint = ionBreakpoints.lg + '';
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.currentBreakpoint = calcBreakPoint();
  }
  async componentDidLoad() {
    this.getSlotted();
  }
  async updateOrientation() {
    this.currentBreakpoint = calcBreakPoint();
    switch (this.currentBreakpoint + '') {
      case 'xs':
      case 'sm':
      case 'md':
        this.orientation = "start";
        break;
      case 'lg':
      case 'xl':
      default:
        this.orientation = "end";
        break;
    }
  }
  getSlotted() {
    let slotted = this.element.children;
    this.children = { hasChildren: slotted && slotted.length > 0, numberOfChildren: slotted && slotted.length };
  }
  getAdjustment() {
    return this.orientation === "start" ? "ion-justify-content-start ion-margin-vertical" : "ion-justify-content-end";
  }
  render() {
    if (!this.host.isConnected)
      return;
    return (h(Host, null, h("ion-item", { class: `main-item${this.cssClass ? this.cssClass : ''}`, lines: this.lines, color: this.color }, h("div", { slot: "start" }, h("slot", { name: "start" })), h("ion-grid", null, h("ion-row", null, h("ion-col", { "col-12": true, "col-sm": true, "size-lg": this.labelCol }, h("div", null, h("slot", { name: "label" }))), h("ion-col", { "col-12": true, "col-sm": true, "align-self-end": true, "size-lg": 12 - this.labelCol }, h("div", { class: `flex ${this.getAdjustment()}` }, h("slot", { name: "content" }))))), h("div", { slot: "end" }, h("slot", { name: "buttons" })))));
  }
  get element() { return getElement(this); }
};
__decorate([
  HostElement()
], ListItemLayout.prototype, "host", void 0);
ListItemLayout.style = listItemLayoutCss;

export { ListItemLayout as list_item_layout };

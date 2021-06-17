import { r as registerInstance, e as createEvent, h, g as getElement } from './index-d0e12a29.js';
import { H as HostElement } from './index-3dd6e8f7.js';

const moreChipCss = ":host{display:inherit}more-chip{animation:0.5s linear fadein}@keyframes fadein{from{opacity:0}to{opacity:1}}";

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
const MoreChip = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.showMoreEvent = createEvent(this, "ssapp-show-more", 7);
    this.iconName = "ellipsis-horizontal";
    this.color = 'medium';
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }
  sendShowMoreEvent(evt) {
    this.showMoreEvent.emit(evt);
  }
  render() {
    if (!this.host.isConnected)
      return;
    return (h("ion-button", { fill: "clear", size: "small", color: this.color, onClick: (evt) => this.sendShowMoreEvent(evt) }, h("ion-icon", { slot: "icon-only", name: this.iconName })));
  }
  get element() { return getElement(this); }
};
__decorate([
  HostElement()
], MoreChip.prototype, "host", void 0);
MoreChip.style = moreChipCss;

export { MoreChip as more_chip };

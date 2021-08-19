import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-d0e12a29.js';
import { W as WebManagerService } from './WebManagerService-82558d63.js';
import { w as wizard } from './WizardService-462ec42a.js';
import { H as HostElement } from './index-3dd6e8f7.js';

const managedShipmentListItemCss = ":host{display:block}ion-item.main-item{animation:1s linear fadein}@keyframes fadein{from{opacity:0}to{opacity:1}}";

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
const Shipment = wizard.Model.Shipment;
const SHIPMENT_TYPE = {
  ISSUED: "issued",
  RECEIVED: 'received'
};
const ManagedShipmentListItem = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendErrorEvent = createEvent(this, "ssapp-send-error", 7);
    this.sendNavigateTab = createEvent(this, "ssapp-navigate-tab", 7);
    this.shipmentLineCount = 4;
    this.type = SHIPMENT_TYPE.ISSUED;
    this.shipment = undefined;
    this.manager = undefined;
  }
  sendError(message, err) {
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Shipment Component: ${message}`, err);
  }
  navigateToTab(tab, props) {
    const event = this.sendNavigateTab.emit({
      tab: tab,
      props: props
    });
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored byt all components...`);
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    const prefix = this.type.charAt(0).toUpperCase() + this.type.slice(1).toLowerCase();
    this.manager = await WebManagerService.getWebManager(`${prefix}ShipmentManager`);
    return await this.loadShipment();
  }
  async loadShipment() {
    let self = this;
    if (!self.manager)
      return;
    self.manager.getOne(self.shipmentId, true, (err, shipment) => {
      if (err) {
        self.sendError(`Could not get Shipment with id ${self.shipmentId}`, err);
        return;
      }
      self.shipment = shipment;
    });
  }
  async refresh() {
    await this.loadShipment();
  }
  addLabel() {
    const self = this;
    const getShipmentId = function () {
      if (!self.shipment || !self.shipment.shipmentId)
        return (h("ion-skeleton-text", { animated: true }));
      return self.shipment.shipmentId;
    };
    const getIdLabel = function () {
      if (!self.shipment)
        return (h("ion-skeleton-text", { animated: true }));
      const attribute = self.shipment[self.type === SHIPMENT_TYPE.ISSUED ? 'requesterId' : 'senderId'];
      if (!attribute)
        return (h("ion-skeleton-text", { animated: true }));
      return attribute;
    };
    const buildLabelElement = (props) => {
      return (h("ion-col", { className: "ion-padding-start", size: "auto" }, h("ion-label", { color: "secondary" }, props)));
    };
    return (h("ion-row", { slot: "label", className: "ion-align-items-center" }, buildLabelElement(getShipmentId()), buildLabelElement(getIdLabel())));
  }
  addShipmentLines() {
    if (!this.shipment || !this.shipment.shipmentLines)
      return (h("ion-skeleton-text", { slot: "content", animated: true }));
    return (h("pdm-item-organizer", { slot: "content", "component-name": "managed-orderline-stock-chip", "component-props": JSON.stringify(this.shipment.shipmentLines.map(ol => ({
        "gtin": ol.gtin,
        "quantity": ol.quantity,
        "mode": "detail"
      }))), "id-prop": "gtin", "is-ion-item": "false", "display-count": "3", orientation: this.getOrientation(), onSelectEvent: (evt) => {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        console.log(`Selected ${evt.detail}`);
      } }));
  }
  getOrientation() {
    const layoutEl = this.element.querySelector('list-item-layout');
    return layoutEl ? layoutEl.orientation : 'end';
  }
  addButtons() {
    let self = this;
    if (!self.shipment)
      return (h("ion-skeleton-text", { animated: true }));
    const getButton = function (slot, color, icon, handler) {
      return (h("ion-button", { slot: slot, color: color, fill: "clear", onClick: handler }, h("ion-icon", { size: "large", slot: "icon-only", name: icon })));
    };
    return [
      getButton("buttons", "medium", self.type === SHIPMENT_TYPE.ISSUED ? "cog" : "eye", () => self.navigateToTab('tab-shipment', {
        shipment: self.shipment,
        mode: self.type
      }))
    ];
  }
  render() {
    return (h(Host, null, h("list-item-layout", null, this.addLabel(), this.addShipmentLines(), this.addButtons())));
  }
  get element() { return getElement(this); }
  static get watchers() { return {
    "shipmentId": ["refresh"]
  }; }
};
__decorate([
  HostElement()
], ManagedShipmentListItem.prototype, "host", void 0);
ManagedShipmentListItem.style = managedShipmentListItemCss;

export { ManagedShipmentListItem as managed_shipment_list_item };

import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-d0e12a29.js';
import { W as WebManagerService } from './WebManagerService-e3623754.js';
import { H as HostElement } from './index-3dd6e8f7.js';
import { w as wizard } from './WizardService-a462b2bc.js';
import { g as getBarCodePopOver } from './popOverUtils-2abe6b65.js';

const managedOrderListItemCss = ":host{display:block}ion-item.main-item{animation:1s linear fadein}@keyframes fadein{from{opacity:0}to{opacity:1}}";

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
const Order = wizard.Model.Order;
const ORDER_TYPE = {
  ISSUED: "issued",
  RECEIVED: 'received'
};
const ManagedOrderListItem = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendErrorEvent = createEvent(this, "ssapp-send-error", 7);
    this.sendNavigateTab = createEvent(this, "ssapp-navigate-tab", 7);
    this.type = ORDER_TYPE.ISSUED;
    this.orderManager = undefined;
    this.order = undefined;
  }
  sendError(message, err) {
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Product Component: ${message}`, err);
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
    this.orderManager = await WebManagerService.getWebManager(`${prefix}OrderManager`);
    return await this.loadOrders();
  }
  async loadOrders() {
    let self = this;
    if (!self.orderManager)
      return;
    self.orderManager.getOne(self.orderId, true, (err, order) => {
      if (err) {
        self.sendError(`Could not get Order with id ${self.orderId}`, err);
        return;
      }
      self.order = order;
    });
  }
  async refresh() {
    await this.loadOrders();
  }
  addLabel() {
    const self = this;
    const getOrderIdLabel = function () {
      if (!self.order || !self.order.orderId)
        return (h("ion-skeleton-text", { animated: true }));
      return self.order.orderId;
    };
    const getRequesterIdLabel = function () {
      if (!self.order || !self.order.requesterId)
        return (h("ion-skeleton-text", { animated: true }));
      return self.order.requesterId;
    };
    return (h("ion-label", { slot: "label", color: "secondary" }, getOrderIdLabel(), h("span", { class: "ion-padding-start" }, getRequesterIdLabel())));
  }
  addOrderLines() {
    if (!this.order || !this.order.orderLines)
      return (h("ion-skeleton-text", { slot: "content", animated: true }));
    return (h("pdm-item-organizer", { slot: "content", "component-name": "managed-orderline-stock-chip", "component-props": JSON.stringify(this.order.orderLines.map(ol => ({
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
    const layout = this.element.querySelector('list-item-layout');
    return layout ? layout.orientation : 'end';
  }
  addButtons() {
    let self = this;
    if (!self.order)
      return (h("ion-skeleton-text", { animated: true }));
    const getButton = function (slot, color, icon, handler) {
      return (h("ion-button", { slot: slot, color: color, fill: "clear", onClick: handler }, h("ion-icon", { size: "large", slot: "icon-only", name: icon })));
    };
    const getProcessOrderButton = function () {
      if (self.type === ORDER_TYPE.ISSUED)
        return;
      return getButton("buttons", "medium", "cog", () => self.navigateToTab('tab-shipment', {
        mode: ORDER_TYPE.ISSUED,
        order: self.order
      }));
    };
    const props = {
      mode: self.type,
      order: self.order
    };
    return [
      getButton("buttons", "medium", "barcode", (evt) => getBarCodePopOver({
        type: "code128",
        size: "32",
        scale: "6",
        data: self.order.orderId
      }, evt)),
      getButton("buttons", "medium", "eye", () => self.navigateToTab('tab-order', props)),
      getProcessOrderButton()
    ];
  }
  render() {
    return (h(Host, null, h("list-item-layout", null, this.addLabel(), this.addOrderLines(), this.addButtons())));
  }
  get element() { return getElement(this); }
  static get watchers() { return {
    "orderId": ["refresh"]
  }; }
};
__decorate([
  HostElement()
], ManagedOrderListItem.prototype, "host", void 0);
ManagedOrderListItem.style = managedOrderListItemCss;

export { ManagedOrderListItem as managed_order_list_item };

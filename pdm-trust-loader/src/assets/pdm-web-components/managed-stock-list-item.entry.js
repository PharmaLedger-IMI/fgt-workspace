import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-d0e12a29.js';
import { W as WebManagerService } from './WebManagerService-e3623754.js';
import { H as HostElement } from './index-3dd6e8f7.js';
import { w as wizard } from './WizardService-a462b2bc.js';
import { S as SUPPORTED_LOADERS } from './supported-loader-4cd02ac2.js';
import { g as getBarCodePopOver } from './popOverUtils-13db4611.js';

const managedStockListItemCss = ":host{display:block}ion-item.main-item{animation:1s linear fadein}@keyframes fadein{from{opacity:0}to{opacity:1}}";

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
const { Stock, Batch } = wizard.Model;
const ManagedProductListItem = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendErrorEvent = createEvent(this, "ssapp-send-error", 7);
    this.sendNavigateTab = createEvent(this, "ssapp-navigate-tab", 7);
    this.stockManager = undefined;
    this.stock = undefined;
    this.batches = undefined;
    this.quantity = undefined;
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
    this.stockManager = await WebManagerService.getWebManager("StockManager");
    return await this.loadStock();
  }
  async loadStock() {
    let self = this;
    if (!self.stockManager)
      return;
    self.stockManager.getOne(self.gtin, true, (err, stock) => {
      if (err) {
        self.sendError(`Could not get Product with gtin ${self.gtin}`, err);
        return;
      }
      self.stock = new Stock(stock);
      self.batches = [...stock.batches];
      self.quantity = this.stock.getQuantity();
    });
  }
  async refresh() {
    await this.loadStock();
  }
  addLabel() {
    const self = this;
    const getQuantityLabel = function () {
      if (!self.stock || !self.stock.batches)
        return (h("ion-skeleton-text", { animated: true }));
      return self.stock.getQuantity();
    };
    const getGtinLabel = function () {
      if (!self.stock || !self.stock.gtin)
        return (h("ion-skeleton-text", { animated: true }));
      return self.stock.gtin;
    };
    const getNameLabel = function () {
      if (!self.stock || !self.stock.name)
        return (h("ion-skeleton-text", { animated: true }));
      return self.stock.name;
    };
    return (h("ion-label", { slot: "label", color: "secondary" }, getGtinLabel(), h("span", { class: "ion-padding-start" }, h("ion-badge", null, getQuantityLabel())), h("span", { class: "ion-padding-start" }, getNameLabel())));
  }
  addBatches() {
    if (!this.stock || !this.batches)
      return (h("ion-skeleton-text", { slot: "content", animated: true }));
    return (h("pdm-item-organizer", { slot: "content", "component-name": "batch-chip", "component-props": JSON.stringify(this.batches.map(batch => ({
        "gtin-batch": this.stock.gtin + '-' + batch.batchNumber,
        "quantity": (new Batch(batch)).getQuantity(),
        "mode": "detail",
        "loader-type": SUPPORTED_LOADERS.bubblingSmall
      }))), "id-prop": "gtin-batch", "is-ion-item": "false", "display-count": "2", orientation: this.getOrientation(), onSelectEvent: (evt) => {
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
    if (!self.stock)
      return (h("ion-skeleton-text", { animated: true }));
    const getButton = function (slot, color, icon, handler) {
      return (h("ion-button", { slot: slot, color: color, fill: "clear", onClick: handler }, h("ion-icon", { size: "large", slot: "icon-only", name: icon })));
    };
    return [
      getButton("buttons", "medium", "barcode", (evt) => getBarCodePopOver({
        type: "code128",
        size: "32",
        scale: "6",
        data: self.gtin
      }, evt)),
      getButton("buttons", "medium", "eye", () => self.navigateToTab('tab-batches', { gtin: self.gtin }))
    ];
  }
  render() {
    return (h(Host, null, h("list-item-layout", null, this.addLabel(), this.addBatches(), this.addButtons())));
  }
  get element() { return getElement(this); }
  static get watchers() { return {
    "gtin": ["refresh"]
  }; }
};
__decorate([
  HostElement()
], ManagedProductListItem.prototype, "host", void 0);
ManagedProductListItem.style = managedStockListItemCss;

export { ManagedProductListItem as managed_stock_list_item };

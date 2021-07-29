import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-d0e12a29.js';
import { W as WebManagerService } from './WebManagerService-82558d63.js';
import { H as HostElement } from './index-3dd6e8f7.js';
import { w as wizard } from './WizardService-462ec42a.js';
import { S as SUPPORTED_LOADERS } from './supported-loader-4cd02ac2.js';

const simpleManagedProductItemCss = ":host{display:block;--background:inherit}ion-item.simple-item{animation:750ms linear fadein}@keyframes fadein{from{opacity:0}to{opacity:1}}";

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
const Product = wizard.Model.Product;
const SimpleManagedProductItem = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendErrorEvent = createEvent(this, "ssapp-send-error", 7);
    this.sendActionEvent = createEvent(this, "ssapp-action", 7);
    this.productManager = undefined;
    this.product = undefined;
  }
  sendError(message, err) {
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Product Component: ${message}`, err);
  }
  sendAction(message) {
    const event = this.sendActionEvent.emit(message);
    if (!event.defaultPrevented)
      console.log(`Product Component: ${message}`);
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.productManager = await WebManagerService.getWebManager("ProductManager");
    return await this.loadProduct();
  }
  async loadProduct() {
    let self = this;
    if (!self.productManager)
      return;
    self.productManager.getOne(self.gtin, true, (err, product) => {
      if (err)
        return self.sendError(`Could not get Product with gtin ${self.gtin}`, err);
      this.product = product;
    });
  }
  async refresh() {
    await this.loadProduct();
  }
  addBarCode() {
    const self = this;
    const getBarCode = function () {
      if (!self.product || !self.product.gtin)
        return (h("multi-spinner", { type: SUPPORTED_LOADERS.bubblingSmall }));
      return (h("barcode-generator", { class: "ion-align-self-center", type: "code128", size: "16", scale: "3", data: self.product.gtin }));
    };
    return (h("ion-thumbnail", { class: "ion-align-self-center", slot: "start" }, getBarCode()));
  }
  addLabel() {
    const self = this;
    const getGtinLabel = function () {
      if (!self.gtin)
        return (h("h4", null, h("ion-skeleton-text", { animated: true }), " "));
      return (h("h4", null, self.gtin));
    };
    const getNameLabel = function () {
      if (!self.product || !self.product.name)
        return (h("h5", null, h("ion-skeleton-text", { animated: true }), " "));
      return (h("h5", null, self.product.name));
    };
    return (h("ion-label", { class: "ion-padding-horizontal ion-align-self-center" }, getGtinLabel(), getNameLabel()));
  }
  render() {
    return (h(Host, null, h("ion-item", { lines: "none", button: true, onClick: () => this.sendAction(this.gtin), class: "ion-align-self-center simple-item" }, this.addBarCode(), this.addLabel())));
  }
  get element() { return getElement(this); }
  static get watchers() { return {
    "gtin": ["refresh"]
  }; }
};
__decorate([
  HostElement()
], SimpleManagedProductItem.prototype, "host", void 0);
SimpleManagedProductItem.style = simpleManagedProductItemCss;

export { SimpleManagedProductItem as simple_managed_product_item };

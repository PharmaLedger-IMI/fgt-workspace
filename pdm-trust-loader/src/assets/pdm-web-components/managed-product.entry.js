import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-21b82b33.js';
import { H as HostElement } from './index-993dbba1.js';
import { w as wizard } from './WizardService-2f7a45ff.js';
import { W as WebManagerService } from './WebManagerService-65b4b71c.js';
import { g as getBarCodePopOver } from './popOverUtils-dba969aa.js';

const managedProductCss = ":host{display:block}";

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
const { generateGtin, generateProductName } = wizard.Model.utils;
const Product = wizard.Model.Product;
const ManagedProduct = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendErrorEvent = createEvent(this, "ssapp-send-error", 7);
    this.sendNavigateTab = createEvent(this, "ssapp-navigate-tab", 7);
    this.sendCreateAction = createEvent(this, "ssapp-action", 7);
    this.gtin = undefined;
    this.manufName = undefined;
    // strings
    this.titleString = "Title String";
    this.manageString = "Manage String";
    this.backString = "Back to Products";
    this.nameString = "Product Name";
    this.gtinString = "Product Gtin";
    this.manufString = "Product Manufacturer Id";
    this.descriptionString = "Product Description";
    this.descriptionPlaceholderString = "Enter any description here...";
    this.addProductString = "Add Product";
    this.clearString = "Clear";
    this.batchesTitle = "Batches for";
    this.batchesAddButton = "Add Batch";
    this.productManager = undefined;
    this.product = undefined;
    this.layoutComponent = undefined;
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
    this.productManager = await WebManagerService.getWebManager("ProductManager");
    await this.load();
  }
  async componentDidRender() {
    this.layoutComponent = this.layoutComponent || this.element.querySelector(`create-manage-view-layout`);
  }
  async load() {
    let self = this;
    if (!self.productManager)
      return;
    if (this.isCreate()) {
      this.product = undefined;
      return;
    }
    self.productManager.getOne(self.gtin, true, (err, product) => {
      if (err) {
        self.sendError(`Could not get Product with gtin ${self.gtin}`, err);
        return;
      }
      this.product = product;
    });
  }
  async refresh() {
    await this.load();
  }
  async reset() {
  }
  navigateBack(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.navigateToTab('tab-products', {});
  }
  create(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.sendCreateAction.emit(new Product(evt.detail));
  }
  async setRandomGtin() {
    const el = await this.layoutComponent.getInput("gtin");
    el.setFocus();
    el.value = generateGtin();
  }
  async setRandomName() {
    const el = await this.layoutComponent.getInput("name");
    el.setFocus();
    el.value = generateProductName();
  }
  isCreate() {
    return !this.gtin || this.gtin.startsWith('@');
  }
  getInputs() {
    const self = this;
    const isCreate = self.isCreate();
    const getRandomNameButton = function () {
      if (!isCreate)
        return;
      return (h("ion-button", { size: "large", fill: "clear", slot: "end", onClick: () => self.setRandomName.call(self) }, h("ion-icon", { slot: "icon-only", name: "shuffle" })));
    };
    const getRandomGtinButton = function () {
      if (!isCreate)
        return;
      return (h("ion-button", { size: "large", fill: "clear", slot: "end", onClick: () => self.setRandomGtin() }, h("ion-icon", { slot: "icon-only", name: "shuffle" })));
    };
    const getBarCodeButton = function () {
      if (isCreate)
        return;
      return (h("ion-button", { size: "large", color: "medium", fill: "clear", slot: "end", onClick: (evt) => getBarCodePopOver({
          type: "code128",
          size: "32",
          scale: "6",
          data: self.gtin
        }, evt) }, h("ion-icon", { slot: "icon-only", name: "barcode" })));
    };
    return [
      h("ion-item", { class: "ion-margin-vertical" }, h("ion-label", { position: "floating" }, self.nameString), h("ion-input", { name: "input-name", required: true, maxlength: 30, disabled: !self.isCreate(), value: self.isCreate() ? '' : (self.product ? self.product.name : '') }), getRandomNameButton()),
      h("ion-item", { class: "ion-margin-bottom" }, h("ion-label", { position: "floating" }, self.gtinString), h("ion-input", { name: "input-gtin", type: "number", required: true, maxlength: 14, minlength: 14, disabled: !self.isCreate(), value: self.isCreate() ? '' : (self.product ? self.product.gtin : '') }), isCreate ? getRandomGtinButton() : getBarCodeButton()),
      h("ion-item", { class: "ion-margin-bottom" }, h("ion-label", { position: "floating" }, self.manufString), h("ion-input", { name: "input-manufName", required: true, disabled: true, value: self.manufName })),
      h("ion-item", { class: "ion-margin-bottom" }, h("ion-label", { position: "floating" }, self.descriptionString), h("ion-textarea", { name: "input-description", required: true, rows: 6, cols: 20, placeholder: self.descriptionPlaceholderString, maxlength: 500, spellcheck: true, disabled: !self.isCreate(), value: self.isCreate() ? '' : (self.product ? self.product.description : '') }))
    ];
  }
  getCreate() {
    if (!this.isCreate())
      return [];
    return this.getInputs();
  }
  getManage() {
    if (this.isCreate())
      return;
    return (h("pdm-ion-table", { "table-title": this.batchesTitle + ` ${this.gtin}`, "item-reference": "gtin-batch", query: this.gtin, canQuery: false, paginated: true, manager: "BatchManager", "icon-name": "stats-chart", "item-type": "managed-batch-list-item", "items-per-page": "5" }, h("ion-button", { slot: "buttons", color: "secondary", fill: "solid", onClick: () => this.navigateToTab('tab-batch', {
        gtin: this.gtin,
        batchNumber: undefined
      }) }, this.batchesAddButton, h("ion-icon", { slot: "end", name: "add-circle" }))));
  }
  getPostCreate() {
    if (this.isCreate())
      return [];
    return this.getInputs();
  }
  getView() {
  }
  render() {
    if (!this.host.isConnected)
      return;
    return (h(Host, null, h("create-manage-view-layout", { "create-title-string": this.titleString, "manage-title-string": this.manageString, "back-string": this.backString, "create-string": this.addProductString, "clear-string": this.clearString, "icon-name": "layers", "is-create": this.isCreate(), onGoBackEvent: (evt) => this.navigateBack(evt), onCreateEvent: (evt) => this.create(evt) }, h("div", { slot: "create" }, this.getCreate()), h("div", { slot: "postcreate" }, this.getPostCreate()), h("div", { slot: "manage" }, this.getManage()), h("div", { slot: "view" }))));
  }
  get element() { return getElement(this); }
  static get watchers() { return {
    "gtin": ["refresh"]
  }; }
};
__decorate([
  HostElement()
], ManagedProduct.prototype, "host", void 0);
ManagedProduct.style = managedProductCss;

export { ManagedProduct as managed_product };

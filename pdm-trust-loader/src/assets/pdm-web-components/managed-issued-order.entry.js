import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-21b82b33.js';
import { W as WebManagerService } from './WebManagerService-65b4b71c.js';
import { S as SUPPORTED_LOADERS } from './supported-loader-4cd02ac2.js';
import { H as HostElement } from './index-993dbba1.js';
import './WizardService-2f7a45ff.js';

const managedIssuedOrderCss = ":host{display:block}managed-received-order{--color:var(--ion-color-primary-contrast)}:host ion-grid{width:100%}.product-select .select-interface-option{color:var(--ion-color-secondary)}ion-select.supplier-select::part(placeholder){color:var(--ion-color-secondary)}ion-select.supplier-select::part(text){color:var(--ion-color-primary)}ion-select.supplier-select::part(icon){color:var(--ion-color-primary)}ion-card-title{color:var(--ion-color-primary)}ion-card-subtitle{color:var(--ion-color-secondary)}ion-item.selected{--color:var(--ion-color-success)}ion-item.unnecessary{--color:red}";

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
// @ts-ignore
const { Order, OrderLine, ROLE } = require('wizard').Model;
const MANAGED_ISSUED_ORDER_CUSTOM_EL_NAME = "managed-issued-order-popover";
const ManagedIssuedOrder = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendErrorEvent = createEvent(this, "ssapp-send-error", 7);
    this.sendActionEvent = createEvent(this, "ssapp-action", 7);
    this.sendCreateEvent = createEvent(this, "created", 7);
    this.titleString = 'Create Order';
    this.proceedString = 'Issue Order';
    this.detailsString = 'Details:';
    this.fromString = 'Order from:';
    this.fromPlaceholderString = 'Select a supplier...';
    this.fromAtString = 'At:';
    this.toAtString = 'from:';
    this.productsString = 'Products:';
    this.productsCodeString = 'Product Code:';
    this.quantityString = 'Quantity:';
    this.orderLinesString = 'OrderLines:';
    this.directoryString = 'Directory:';
    this.directoryManager = undefined;
    this.senderId = undefined;
    this.senderAddress = undefined;
    this.suppliers = undefined;
    this.products = undefined;
    this.currentGtin = undefined;
    this.currentQuantity = 0;
  }
  sendError(message, err) {
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Issued Order Component Component: ${message}`, err);
  }
  sendAction(message) {
    const event = this.sendActionEvent.emit(message);
    if (!event.defaultPrevented)
      console.log(`Issue Order: ${message}`);
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.directoryManager = await WebManagerService.getWebManager('DirectoryManager');
  }
  async updateDirectory() {
    this.getDirectoryProductsAsync();
    this.getSuppliersAsync();
  }
  async cancelOrderLine(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const { data } = evt.detail;
    if (data.gtin) {
      const { gtin } = data;
      if (!this.orderLines)
        return;
      let index;
      this.orderLines.every((ol, i) => {
        if (ol.gtin !== gtin)
          return true;
        index = i;
        return false;
      });
      if (index === undefined)
        return;
      this.orderLines.splice(index, 1);
      this.orderLines = [...this.orderLines];
    }
  }
  getDirectoryProductsAsync() {
    const self = this;
    const options = {
      query: [`role == ${ROLE.PRODUCT}`]
    };
    this.directoryManager.getAll(false, options, (err, gtins) => {
      if (err)
        return self.sendError(`Could not get directory listing for ${ROLE.PRODUCT}`, err);
      self.products = gtins;
    });
  }
  getSuppliersAsync(callback) {
    const self = this;
    if (!self.directoryManager)
      return [];
    const options = {
      query: [`role like /${ROLE.MAH}|${ROLE.WHS}/g`]
    };
    self.directoryManager.getAll(false, options, (err, records) => {
      if (err) {
        self.sendError(`Could not list Suppliers from directory`, err);
        return callback(err);
      }
      self.suppliers = records;
      if (callback)
        callback(undefined, records);
    });
  }
  definePopOverContent() {
    const self = this;
    if (!!customElements.get(MANAGED_ISSUED_ORDER_CUSTOM_EL_NAME))
      return;
    customElements.define(MANAGED_ISSUED_ORDER_CUSTOM_EL_NAME, class extends HTMLElement {
      connectedCallback() {
        const contentEl = this;
        const getDirectoryContent = function () {
          if (!self.products)
            return `<multi-spinner type="${SUPPORTED_LOADERS.circles}"></multi-spinner>`;
          const getProductElement = function (gtin) {
            return `<simple-managed-product-item gtin=${gtin}></simple-managed-product-item>`;
          };
          return self.products.map(gtin => getProductElement(gtin)).join(`\n`);
        };
        this.innerHTML = `
<ion-content>
  <ion-list>
    ${getDirectoryContent()}
  </ion-list>
</ion-content>`;
        this.querySelectorAll('simple-managed-product-item').forEach(item => {
          item.addEventListener('click', () => {
            contentEl.closest('ion-popover').dismiss(undefined, item.getAttribute('gtin'));
          });
        });
      }
    });
  }
  async getProductPopOver(evt) {
    this.definePopOverContent();
    const popover = Object.assign(document.createElement('ion-popover'), {
      component: MANAGED_ISSUED_ORDER_CUSTOM_EL_NAME,
      cssClass: 'menu-tab-button-popover',
      translucent: true,
      event: evt,
      showBackdrop: false,
      animated: true,
      backdropDismiss: true,
    });
    document.body.appendChild(popover);
    await popover.present();
    const { role } = await popover.onWillDismiss();
    if (role && role !== 'backdrop')
      this.currentGtin = role;
  }
  getOrderLines() {
    const self = this;
    if (!self.orderLines || !self.orderLines.length || typeof self.orderLines === 'string')
      return [];
    const genOrderLine = function (o) {
      return (h("managed-orderline-stock-chip", { onSendAction: (evt) => self.cancelOrderLine(evt), gtin: o.gtin, quantity: o.quantity, available: 10 * o.quantity, mode: "detail", button: "cancel" }));
    };
    return self.orderLines.map(o => genOrderLine(o));
  }
  getActionButtons() {
    const self = this;
    const getButton = function (color, text, enabled = true, margin = true, visible = true) {
      return (h("ion-button", { class: `${!visible ? 'ion-hide' : ''} ${!!margin ? 'ion-margin-horizontal' : ''}`, color: color, size: "small", fill: "outline", disabled: !enabled, onClick: () => self.sendAction(new Order(undefined, self.requester.id, self.senderId, self.requester.address, undefined, self.orderLines)) }, h("ion-label", null, text)));
    };
    return (h("ion-buttons", { class: "ion-float-end ion-justify-content-end" }, getButton("success", self.proceedString, !!this.orderLines && !!this.orderLines.length && !!this.senderId)));
  }
  getHeader() {
    return (h("ion-card-header", { class: "ion-padding" }, h("ion-card-title", null, this.titleString, this.getActionButtons())));
  }
  getLoading(type = SUPPORTED_LOADERS.simple) {
    return (h("multi-loader", { type: type }));
  }
  getMap() {
    return (h("ion-thumbnail", null, h("ion-icon", { name: "map-outline" })));
  }
  getRequesterLocale() {
    const self = this;
    const getAddress = function () {
      if (!self.requester)
        return (h("ion-skeleton-text", { animated: true }));
      return (h("ion-input", { disabled: true, value: self.requester.address }));
    };
    return (h("ion-item", { lines: "none", class: "ion-no-padding" }, h("ion-label", { position: "stacked" }, self.fromAtString), getAddress()));
  }
  getSenderLocale() {
    const self = this;
    const getAddress = function () {
      return (h("ion-input", { disabled: true, value: self.senderAddress ? self.senderAddress : '-' }));
    };
    return (h("ion-item", { class: "ion-no-padding" }, h("ion-label", { position: "stacked" }, self.toAtString), getAddress()));
  }
  getSender() {
    const self = this;
    const options = {
      cssClass: 'product-select'
    };
    const getFrom = function () {
      const result = [];
      if (self.suppliers) {
        result.push(h("ion-select", { name: "input-senderId", interface: "popover", interfaceOptions: options, class: "supplier-select", placeholder: self.fromPlaceholderString }, self.suppliers.map(s => (h("ion-select-option", { value: s }, s)))));
      }
      else {
        result.push(self.getLoading(SUPPORTED_LOADERS.bubblingSmall));
      }
      return result;
    };
    return (h("ion-item", { lines: "none", class: "ion-no-padding", disabled: false }, h("ion-label", { position: "stacked" }, this.fromString), getFrom()));
  }
  getDetails() {
    return (h("ion-grid", { class: "ion-no-padding" }, h("ion-row", null, h("ion-col", { size: "4" }, this.getSender()), h("ion-col", { size: "2" }, this.getRequesterLocale()), h("ion-col", { size: "3" }, this.getSenderLocale()), h("ion-col", { size: "2" }, this.getMap()))));
  }
  scan() {
    const self = this;
    const controller = self.element.querySelector('pdm-barcode-scanner-controller');
    if (!controller)
      return console.log(`Could not find scan controller`);
    controller.present((err, scanData) => {
      if (err)
        return self.sendError(`Could not scan`, err);
      console.log(scanData);
      self.currentGtin = scanData ? scanData.gtin || scanData.productCode || scanData.result : undefined;
    });
  }
  onProductInputChange(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const { target } = evt;
    const { name, value } = target;
    console.log(evt, target, name, value);
    if (name === 'input-quantity')
      this.currentQuantity = value;
    if (name === 'input-senderId')
      this.senderId = value;
  }
  addOrderLine(gtin, quantity) {
    const updated = [];
    if (Array.isArray(this.orderLines))
      updated.push(...this.orderLines);
    const existing = updated.filter(u => u.gtin === gtin);
    if (existing.length) {
      existing[0].quantity += quantity;
      this.orderLines = [...updated];
    }
    else {
      const ol = new OrderLine(gtin, quantity, this.requester.id, this.senderId);
      this.orderLines = [...updated, ol];
    }
    this.currentGtin = undefined;
    this.currentQuantity = 0;
  }
  getProductInput() {
    return (h("ion-grid", null, h("ion-row", { class: "ion-align-items-end" }, h("ion-col", { size: "6" }, h("ion-item", { class: "ion-no-padding" }, h("ion-label", { position: "stacked" }, this.productsCodeString), h("ion-input", { name: "input-gtin", type: "number", value: this.currentGtin }), h("ion-buttons", { slot: "end" }, h("ion-button", { onClick: () => this.scan() }, h("ion-icon", { color: "tertiary", slot: "icon-only", name: "scan-circle" })), h("ion-button", { onClick: (evt) => this.getProductPopOver(evt) }, h("ion-icon", { color: "secondary", slot: "icon-only", name: "add-circle" }))))), h("ion-col", { size: "1" }, h("ion-item", null, h("ion-label", { position: "stacked" }, this.quantityString), h("ion-input", { name: "input-quantity", type: "number", value: this.currentQuantity || 0 }))), h("ion-col", { size: "4" }, h("ion-item", null, h("ion-range", { name: "input-quantity", style: { width: '70%' }, min: 0, max: Math.max(this.currentQuantity || 0, 100), pin: false, value: this.currentQuantity || 0, color: "secondary" }, h("ion-button", { class: "ion-padding-horizontal", slot: "start", size: "small", fill: "clear", onClick: () => this.currentQuantity-- }, h("ion-icon", { color: "secondary", slot: "icon-only", size: "small", name: "remove-circle" })), h("ion-button", { class: "ion-padding-horizontal", slot: "end", size: "small", fill: "clear", onClick: () => this.currentQuantity++ }, h("ion-icon", { color: "secondary", slot: "icon-only", size: "small", name: "add-circle" }))))), h("ion-col", { size: "1" }, h("ion-buttons", null, h("ion-button", { color: "success", disabled: !this.currentGtin || !this.currentQuantity, onClick: () => this.addOrderLine(this.currentGtin, this.currentQuantity) }, h("ion-icon", { slot: "icon-only", name: "add-circle" })))))));
  }
  render() {
    return (h(Host, null, h("ion-card", { class: "ion-margin" }, this.getHeader(), h("ion-card-content", null, h("ion-item-divider", null, h("ion-label", null, this.detailsString)), this.getDetails(), h("ion-item-divider", null, h("ion-label", null, this.productsString)), this.getProductInput(), h("ion-item-divider", null, h("ion-label", null, this.orderLinesString)), this.getOrderLines())), h("pdm-barcode-scanner-controller", { "barcode-title": "@scan" })));
  }
  get element() { return getElement(this); }
};
__decorate([
  HostElement()
], ManagedIssuedOrder.prototype, "host", void 0);
ManagedIssuedOrder.style = managedIssuedOrderCss;

export { ManagedIssuedOrder as managed_issued_order };

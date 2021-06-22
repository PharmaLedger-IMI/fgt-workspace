import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-d0e12a29.js';
import { H as HostElement } from './index-3dd6e8f7.js';
import { w as wizard } from './WizardService-a462b2bc.js';
import { W as WebManagerService } from './WebManagerService-e3623754.js';
import { a as getDirectoryProducts, b as getDirectorySuppliers, c as getDirectoryRequesters, d as getProductPopOver } from './popOverUtils-b2c08a50.js';

const managedOrderCss = ":host{display:block}managed-order{--color:var(--ion-color-primary-contrast)}managed-order ion-item ion-grid{width:100%}.product-select .select-interface-option{color:var(--ion-color-secondary)}ion-select.supplier-select::part(placeholder){color:var(--ion-color-secondary)}ion-select.supplier-select::part(text){color:var(--ion-color-primary)}ion-select.supplier-select::part(icon){color:var(--ion-color-primary)}ion-card-title{color:var(--ion-color-primary)}ion-card-subtitle{color:var(--ion-color-secondary)}ion-item.selected{--color:var(--ion-color-success)}ion-item.unnecessary{--color:red}";

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
const ORDER_TYPE = {
  ISSUED: "issued",
  RECEIVED: 'received'
};
const { Order, OrderLine, ROLE } = wizard.Model;
const ManagedOrder = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendErrorEvent = createEvent(this, "ssapp-send-error", 7);
    this.sendNavigateTab = createEvent(this, "ssapp-navigate-tab", 7);
    this.sendCreateAction = createEvent(this, "ssapp-action", 7);
    this.orderType = ORDER_TYPE.ISSUED;
    // strings
    this.titleString = "Title String";
    this.manageString = "Manage String";
    this.backString = "Back to Products";
    this.scanString = "Please Scan your Product";
    this.createString = "Issue Order";
    this.clearString = "Clear";
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
    // Displays
    this.statusString = 'Shipment Status:';
    // Stock Management
    this.stockString = 'Stock:';
    this.noStockString = 'Empty';
    this.resetAllString = 'Reset All';
    this.confirmedString = 'Confirmed:';
    this.confirmAllString = 'Confirm All';
    this.availableString = 'Available:';
    this.unavailableString = 'Unavailable:';
    this.selectString = 'Please Select an item...';
    this.remainingString = 'Remaining:';
    this.orderMissingString = 'Order Missing';
    // Directory Variables
    this.directoryManager = undefined;
    this.suppliers = undefined;
    this.products = undefined;
    this.requesters = undefined;
    this.issuedOrderManager = undefined;
    this.receivedOrderManager = undefined;
    this.lines = undefined;
    // for new Orders
    this.participantId = undefined;
    this.senderAddress = undefined;
    this.currentGtin = undefined;
    this.currentQuantity = 0;
    // for existing ones
    this.rejectString = 'Reject';
    this.proceedString = 'Continue:';
    this.delayString = 'Delay:';
    this.order = undefined;
    this.stockForProduct = undefined;
    this.selectedProduct = undefined;
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
      console.log(`Tab Navigation request seems to have been ignored by all components...`);
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.directoryManager = await WebManagerService.getWebManager('DirectoryManager');
    this.issuedOrderManager = await WebManagerService.getWebManager(`IssuedOrderManager`);
    this.receivedOrderManager = await WebManagerService.getWebManager(`ReceivedOrderManager`);
    return await this.load();
  }
  getManager() {
    return this.isCreate() || this.getType() === ORDER_TYPE.ISSUED ? this.issuedOrderManager : this.receivedOrderManager;
  }
  getType() {
    return this.orderType && !this.orderType.startsWith('@') ? this.orderType : ORDER_TYPE.ISSUED;
  }
  async load() {
    let self = this;
    if (this.isCreate())
      return this.reset();
    await self.getManager().getOne(this.orderRef, true, async (err, order) => {
      if (err)
        return this.sendError(`Could not retrieve order ${self.orderRef}`);
      self.order = order;
      self.participantId = this.getType() === ORDER_TYPE.ISSUED ? order.senderId : order.requesterId;
      self.lines = [...order.orderLines];
    });
  }
  async componentDidRender() {
    this.layoutComponent = this.layoutComponent || this.element.querySelector(`create-manage-view-layout`);
  }
  async updateDirectory() {
    const self = this;
    const getDirectoryProductsAsync = function () {
      getDirectoryProducts(self.directoryManager, (err, gtins) => {
        if (err)
          return self.sendError(`Could not get directory listing for ${ROLE.PRODUCT}`, err);
        self.products = gtins;
      });
    };
    const getDirectorySuppliersAsync = function () {
      getDirectorySuppliers(self.directoryManager, (err, records) => {
        if (err)
          return self.sendError(`Could not list Suppliers from directory`, err);
        self.suppliers = records;
      });
    };
    const getDirectoryRequestersAsync = function () {
      getDirectoryRequesters(self.directoryManager, (err, records) => {
        if (err)
          return self.sendError(`Could not list requesters from directory`, err);
        self.requesters = records;
      });
    };
    getDirectoryProductsAsync();
    getDirectorySuppliersAsync();
    getDirectoryRequestersAsync();
  }
  onInputChange(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const { target } = evt;
    const { name, value } = target;
    if (name === 'input-quantity')
      this.currentQuantity = value;
    if (name === 'input-senderId')
      this.participantId = value;
  }
  async refresh() {
    await this.load();
  }
  async updateLines(newVal) {
    if (newVal.startsWith('@'))
      return;
    this.lines = JSON.parse(newVal).map(o => new OrderLine(o.gtin, o.quantity, o.requesterId, o.senderId));
  }
  async reset() {
    if (this.isCreate() && this.lines && this.orderLines !== "[]") {
      this.order = undefined;
    }
    else {
      this.order = undefined;
      this.lines = [];
      const stockEl = this.getStockManagerEl();
      if (stockEl)
        stockEl.reset();
    }
  }
  getStockManagerEl() {
    return this.element.querySelector('line-stock-manager');
  }
  navigateBack(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.navigateToTab(`tab-${this.getType()}-orders`, {});
  }
  create(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.sendCreateAction.emit(new Order(undefined, this.identity.id, evt.detail.senderId, this.identity.address, undefined, this.lines.slice()));
  }
  isCreate() {
    return !this.orderRef || this.orderRef.startsWith('@');
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
  addOrderLine(gtin, quantity) {
    this.lines = [...this.lines, new OrderLine(gtin, quantity, this.identity.id, this.participantId)];
    this.currentGtin = undefined;
    this.currentQuantity = 0;
  }
  selectOrderLine(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.currentGtin = evt.detail;
  }
  async showProductPopOver(evt) {
    const popover = await getProductPopOver(evt, this.products);
    const { role } = await popover.onWillDismiss();
    if (role && role !== 'backdrop')
      this.currentGtin = role;
  }
  getInputs() {
    const self = this;
    const isCreate = self.isCreate();
    const getSender = function () {
      const options = {
        cssClass: 'product-select'
      };
      const getFrom = function () {
        const result = [];
        const directory = self.getType() === ORDER_TYPE.ISSUED ? self.suppliers : self.requesters;
        if (directory) {
          result.push(h("ion-select", { name: "input-senderId", interface: "popover", interfaceOptions: options, class: "supplier-select", placeholder: self.getType() === ORDER_TYPE.ISSUED ? self.fromPlaceholderString : '', disabled: !isCreate, value: !isCreate ? self.participantId : '' }, directory.map(s => (h("ion-select-option", { value: s }, s)))));
        }
        else {
          result.push(h("ion-skeleton-text", { animated: true }));
        }
        return result;
      };
      return (h("ion-item", { lines: "none", disabled: false }, h("ion-label", { position: "stacked" }, self.fromString), getFrom()));
    };
    const getRequesterLocale = function () {
      const getAddress = function () {
        if (!self.order)
          return (h("ion-skeleton-text", { animated: true }));
        return (h("ion-input", { disabled: true, value: self.order.shipToAddress }));
      };
      return (h("ion-item", { lines: "none" }, h("ion-label", { position: "stacked" }, self.getType() === ORDER_TYPE.ISSUED ? self.fromAtString : self.toAtString), getAddress()));
    };
    const getStatus = function () {
      const getBadge = function () {
        if (!self.order)
          return (h("ion-skeleton-text", { animated: true }));
        return (h("ion-badge", { class: "ion-padding-horizontal" }, self.order.status));
      };
      return (h("ion-item", { lines: "none" }, h("ion-label", { position: "stacked" }, self.statusString), getBadge()));
    };
    const getProductInput = function () {
      return (h("ion-item", { lines: "none" }, h("ion-label", { position: "stacked" }, self.productsCodeString), h("ion-input", { name: "input-gtin", type: "number", value: self.currentGtin }), h("ion-buttons", { slot: "end" }, h("ion-button", { onClick: () => self.scan(), color: "medium", size: "large", fill: "clear" }, h("ion-icon", { slot: "icon-only", name: "scan-circle" })), h("ion-button", { onClick: (evt) => self.showProductPopOver(evt), color: "secondary", size: "large", fill: "clear" }, h("ion-icon", { slot: "icon-only", name: "add-circle" })))));
    };
    const getQuantityInput = function () {
      return (h("ion-item", { lines: "none" }, h("ion-label", { position: "stacked" }, self.quantityString), h("ion-grid", null, h("ion-row", null, h("ion-col", { size: "10" }, h("ion-range", { name: "input-quantity", min: 0, max: Math.max(self.currentQuantity || 0, 100), pin: true, value: self.currentQuantity || 0, color: "secondary" }, h("ion-button", { slot: "start", fill: "clear", color: "secondary", onClick: () => self.currentQuantity-- }, h("ion-icon", { color: "secondary", slot: "icon-only", name: "remove-circle" })), h("ion-button", { slot: "end", fill: "clear", color: "secondary", onClick: () => self.currentQuantity++ }, h("ion-icon", { slot: "icon-only", name: "add-circle" })))), h("ion-col", { size: "2", class: "ion-padding-left" }, h("ion-input", { name: "input-quantity", type: "number", value: self.currentQuantity || 0 })))), h("ion-button", { slot: "end", size: "large", fill: "clear", color: "success", disabled: !self.currentGtin || !self.currentQuantity, onClick: () => self.addOrderLine(self.currentGtin, self.currentQuantity) }, h("ion-icon", { slot: "icon-only", name: "add-circle" }))));
    };
    if (isCreate)
      return [
        getSender(),
        getProductInput(),
        getQuantityInput()
      ];
    return [
      getSender(),
      getRequesterLocale(),
      getStatus()
    ];
  }
  getCreate() {
    if (!this.isCreate())
      return [];
    return [
      ...this.getInputs(),
      h("line-stock-manager", { lines: this.lines, "show-stock": false, "enable-actions": true, onSelectEvent: (evt) => this.selectOrderLine(evt), "single-line": "false", "lines-string": this.orderLinesString, "stock-string": this.stockString, "no-stock-string": this.noStockString, "select-string": this.selectString, "remaining-string": this.remainingString, "order-missing-string": this.orderMissingString, "available-string": this.availableString, "unavailable-string": this.unavailableString, "confirmed-string": this.confirmedString, "confirm-all-string": this.confirmAllString, "reset-all-string": this.resetAllString })
    ];
  }
  getPostCreate() {
    if (this.isCreate())
      return [];
    return this.getInputs();
  }
  getManage() {
    if (this.isCreate())
      return;
    return (h("line-stock-manager", { lines: this.lines, "show-stock": this.isCreate(), "enable-action": this.getType() === ORDER_TYPE.RECEIVED || this.isCreate(), "single-line": "false", "stock-string": this.stockString, "no-stock-string": this.noStockString, "select-string": this.selectString, "remaining-string": this.remainingString, "order-missing-string": this.orderMissingString, "available-string": this.availableString, "unavailable-string": this.unavailableString, "confirmed-string": this.confirmedString, "confirm-all-string": this.confirmAllString, "reset-all-string": this.resetAllString }));
  }
  getView() {
  }
  render() {
    if (!this.host.isConnected)
      return;
    return (h(Host, null, h("create-manage-view-layout", { "create-title-string": this.titleString, "manage-title-string": this.manageString, "back-string": this.backString, "create-string": this.createString, "clear-string": this.clearString, "icon-name": "layers", "is-create": this.isCreate(), onGoBackEvent: (evt) => this.navigateBack(evt), onCreateEvent: (evt) => this.create(evt) }, h("div", { slot: "create" }, this.getCreate()), h("div", { slot: "postcreate" }, this.getPostCreate()), h("div", { slot: "manage" }, this.getManage()), h("div", { slot: "view" }, this.getView())), h("pdm-barcode-scanner-controller", { "barcode-title": this.scanString })));
  }
  get element() { return getElement(this); }
  static get watchers() { return {
    "orderRef": ["refresh"],
    "orderLines": ["updateLines"]
  }; }
};
__decorate([
  HostElement()
], ManagedOrder.prototype, "host", void 0);
ManagedOrder.style = managedOrderCss;

export { ManagedOrder as managed_order };

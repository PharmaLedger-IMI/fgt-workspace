import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-d0e12a29.js';
import { H as HostElement } from './index-3dd6e8f7.js';
import { w as wizard } from './WizardService-2f7a45ff.js';
import { W as WebManagerService } from './WebManagerService-65b4b71c.js';
import { a as getDirectoryProducts, d as getDirectoryRequesters, c as getProductPopOver } from './popOverUtils-dba969aa.js';

const managedShipmentCss = ":host{display:block}managed-shipment{--color:var(--ion-color-primary-contrast)}managed-shipment ion-item ion-grid{width:100%}ion-card-title{color:var(--ion-color-primary)}ion-card-subtitle{color:var(--ion-color-secondary)}ion-item.selected{--color:var(--ion-color-success)}ion-item.unnecessary{--color:red}";

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
const SHIPMENT_TYPE = {
  ISSUED: "issued",
  RECEIVED: 'received'
};
const { ROLE, OrderLine, Shipment, Order } = wizard.Model;
const ManagedShipment = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendErrorEvent = createEvent(this, "ssapp-send-error", 7);
    this.sendNavigateTab = createEvent(this, "ssapp-navigate-tab", 7);
    this.sendCreateAction = createEvent(this, "ssapp-action", 7);
    this.orderJSON = undefined;
    this.shipmentType = SHIPMENT_TYPE.ISSUED;
    // strings
    // General
    this.titleString = "Title String";
    this.manageString = "Manage String";
    this.backString = "Back";
    this.scanString = "Please Scan your Product";
    // Form Buttons
    this.createString = "Issue Shipment";
    this.clearString = "Clear";
    // Input Strings
    this.orderIdString = 'Order Id:';
    this.fromString = 'Shipment from:';
    this.to_String = 'Shipment to:';
    this.toPlaceholderString = 'Select a requester...';
    this.fromAtString = 'At:';
    this.toAtString = 'from:';
    this.productsString = 'Products:';
    this.productsCodeString = 'Product Code:';
    this.quantityString = 'Quantity:';
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
    this.products = undefined;
    this.requesters = undefined;
    this.issuedShipmentManager = undefined;
    this.receivedShipmentManager = undefined;
    this.layoutComponent = undefined;
    // for new Shipments
    this.participantId = undefined;
    this.shipment = undefined;
    this.lines = [];
    this.currentGtin = undefined;
    this.currentQuantity = 0;
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
    this.directoryManager = await WebManagerService.getWebManager('DirectoryManager');
    this.issuedShipmentManager = await WebManagerService.getWebManager(`IssuedShipmentManager`);
    this.receivedShipmentManager = await WebManagerService.getWebManager(`ReceivedShipmentManager`);
    return await this.load();
  }
  getManager() {
    return this.isCreate() || this.getType() === SHIPMENT_TYPE.ISSUED ? this.issuedShipmentManager : this.receivedShipmentManager;
  }
  getType() {
    return this.shipmentType && !this.shipmentType.startsWith('@') ? this.shipmentType : SHIPMENT_TYPE.ISSUED;
  }
  async load() {
    let self = this;
    if (this.isCreate())
      return this.reset();
    // @ts-ignore
    self.getManager().getOne(this.shipmentRef, true, async (err, shipment, dsu, orderId) => {
      if (err)
        return this.sendError(`Could not retrieve shipment ${self.shipmentRef}`);
      shipment.orderId = orderId;
      self.shipment = shipment;
      self.participantId = this.getType() === SHIPMENT_TYPE.ISSUED ? shipment.requesterId : shipment.senderId;
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
    const getDirectoryRequestersAsync = function () {
      getDirectoryRequesters(self.directoryManager, (err, records) => {
        if (err)
          return self.sendError(`Could not list requesters from directory`, err);
        self.requesters = records;
      });
    };
    getDirectoryProductsAsync();
    getDirectoryRequestersAsync();
  }
  async showProductPopOver(evt) {
    const popover = await getProductPopOver(evt, this.products);
    const { role } = await popover.onWillDismiss();
    if (role && role !== 'backdrop')
      this.currentGtin = role;
  }
  onInputChange(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const { target } = evt;
    const { name, value } = target;
    if (name === 'input-quantity')
      this.currentQuantity = value;
    if (this.getType() === SHIPMENT_TYPE.ISSUED && name === 'input-requesterId'
      || this.getType() === SHIPMENT_TYPE.RECEIVED && name === 'input-senderId')
      this.participantId = value;
  }
  async refresh() {
    await this.load();
  }
  async refreshOrder(newVal) {
    if (newVal.startsWith('@'))
      return;
    const order = JSON.parse(newVal);
    if (!order.orderId)
      this.order = undefined;
    else {
      this.order = new Order(order.orderId, order.requesterId, order.senderId, order.shipToAddress, order.status, order.orderLines.map(ol => new OrderLine(ol.gtin, ol.quantity, ol.requesterId, ol.senderId)));
      this.lines = [...this.order.orderLines];
    }
  }
  async reset() {
    this.shipmentRef = '';
    if (!this.orderJSON || this.orderJSON.startsWith('@') || this.orderJSON === "{}") { // for webcardinal compatibility
      this.participantId = '';
      const stockEl = this.getStockManagerEl();
      if (stockEl)
        stockEl.reset();
      this.lines = [];
      this.order = undefined;
    }
    else {
      this.order = JSON.parse(this.orderJSON);
      this.participantId = this.order ? this.order.requesterId : '';
      this.lines = this.order && this.order.orderLines ? [...this.order.orderLines] : [];
    }
  }
  getStockManagerEl() {
    return this.element.querySelector('line-stock-manager');
  }
  navigateBack(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.navigateToTab(`tab-${this.getType()}-shipments`, {});
  }
  async create(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.sendCreateAction.emit({
      shipment: new Shipment(undefined, evt.detail.requesterId, this.identity.id, this.identity.address, undefined, this.lines.slice()),
      stock: await this.getStockManagerEl().getResult(),
      orderId: this.order ? this.order.orderId : undefined
    });
  }
  isCreate() {
    return !this.shipmentRef || this.shipmentRef.startsWith('@');
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
    this.lines = [...this.lines, new OrderLine(gtin, quantity, this.participantId, this.identity.id)];
    this.currentGtin = undefined;
    this.currentQuantity = 0;
  }
  selectOrderLine(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.currentGtin = evt.detail;
  }
  getInputs() {
    const self = this;
    const isCreate = self.isCreate();
    const options = {
      cssClass: 'select-popover-select'
    };
    const getOrderReference = function () {
      const getInput = function () {
        if (self.getType() === SHIPMENT_TYPE.ISSUED && self.order && isCreate) {
          return (h("ion-input", { name: "input-orderId", disabled: true, value: self.getType() === SHIPMENT_TYPE.ISSUED ? self.order.orderId || self.shipment.orderId : 'TODO' }));
        }
        else {
          h("ion-skeleton-text", { animated: true });
        }
      };
      return (h("ion-item", { lines: "none", disabled: false }, h("ion-label", { position: "stacked" }, self.orderIdString), getInput()));
    };
    const getSender = function () {
      const getFrom = function () {
        if (self.getType() === SHIPMENT_TYPE.ISSUED && self.requesters && isCreate) {
          return (h("ion-select", { name: "input-senderId", interface: "popover", interfaceOptions: options, class: "sender-select", disabled: !isCreate, value: !isCreate ? self.participantId : '' }, self.requesters.map(s => (h("ion-select-option", { value: s }, s)))));
        }
        else if (isCreate || self.getType() === SHIPMENT_TYPE.RECEIVED) {
          return (h("ion-input", { name: "input-senderId", disabled: true, value: self.getType() === SHIPMENT_TYPE.RECEIVED ? self.participantId : self.identity.id }));
        }
        else {
          h("ion-skeleton-text", { animated: true });
        }
      };
      return (h("ion-item", { lines: "none", disabled: false }, h("ion-label", { position: "stacked" }, self.fromString), getFrom()));
    };
    const getRequester = function () {
      const getTo = function () {
        if (self.getType() === SHIPMENT_TYPE.ISSUED && self.requesters && isCreate) {
          const options = {
            cssClass: 'product-select'
          };
          return (h("ion-select", { name: "input-requesterId", interface: "popover", interfaceOptions: options, class: "requester-select", disabled: isCreate && self.order && !self.order.requesterID, value: isCreate ? (self.order ? self.order.requesterId : self.participantId) : '' }, self.requesters.map(s => (h("ion-select-option", { value: s }, s)))));
        }
        else if (self.getType() === SHIPMENT_TYPE.RECEIVED) {
          return (h("ion-input", { name: "input-requesterId", disabled: true, value: self.shipment.requesterId }));
        }
        else {
          return h("ion-skeleton-text", { animated: true });
        }
      };
      return (h("ion-item", { lines: "none", disabled: false }, h("ion-label", { position: "stacked" }, self.to_String), getTo()));
    };
    const getRequesterLocale = function () {
      const getAddress = function () {
        if (!self.shipment && !self.order)
          return (h("ion-skeleton-text", { animated: true }));
        return (h("ion-input", { name: "input-requester-address", disabled: true, value: self.order ? self.order.shipToAddress : self.shipment.shipFromAddress }));
      };
      return (h("ion-item", { lines: "none" }, h("ion-label", { position: "stacked" }, self.fromAtString), getAddress()));
    };
    const getSenderLocale = function () {
      const getAddress = function () {
        if (!self.shipment && !self.order)
          return (h("ion-skeleton-text", { animated: true }));
        return (h("ion-input", { name: "input-sender-address", disabled: true, value: self.order ? self.order.shipFromAddress : self.shipment.shipToAddress }));
      };
      return (h("ion-item", { lines: "none" }, h("ion-label", { position: "stacked" }, self.toAtString), getAddress()));
    };
    const getStatus = function () {
      if (isCreate)
        return;
      const getBadge = function () {
        if (!self.shipment)
          return (h("ion-skeleton-text", { animated: true }));
        return (h("ion-badge", { class: "ion-padding-horizontal" }, self.shipment.status));
      };
      return (h("ion-item", { lines: "none" }, h("ion-label", { position: "stacked" }, self.statusString), getBadge()));
    };
    const getProductInput = function () {
      return (h("ion-item", { lines: "none" }, h("ion-label", { position: "stacked" }, self.productsCodeString), h("ion-input", { name: "input-gtin", type: "number", value: self.currentGtin }), h("ion-buttons", { slot: "end" }, h("ion-button", { onClick: () => self.scan(), color: "medium", size: "large", fill: "clear" }, h("ion-icon", { slot: "icon-only", name: "scan-circle" })), h("ion-button", { onClick: (evt) => self.showProductPopOver(evt), color: "secondary", size: "large", fill: "clear" }, h("ion-icon", { slot: "icon-only", name: "add-circle" })))));
    };
    const getQuantityInput = function () {
      return (h("ion-item", { lines: "none" }, h("ion-label", { position: "stacked" }, self.quantityString), h("ion-grid", null, h("ion-row", null, h("ion-col", { size: "10" }, h("ion-range", { name: "input-quantity", min: 0, max: Math.max(self.currentQuantity || 0, 100), pin: true, value: self.currentQuantity || 0, color: "secondary" }, h("ion-button", { slot: "start", fill: "clear", color: "secondary", onClick: () => self.currentQuantity-- }, h("ion-icon", { color: "secondary", slot: "icon-only", name: "remove-circle" })), h("ion-button", { slot: "end", fill: "clear", color: "secondary", onClick: () => self.currentQuantity++ }, h("ion-icon", { slot: "icon-only", name: "add-circle" })))), h("ion-col", { size: "2", class: "ion-padding-left" }, h("ion-input", { name: "input-quantity", type: "number", value: self.currentQuantity || 0 })))), h("ion-button", { slot: "end", size: "large", fill: "clear", color: "success", disabled: !self.currentGtin || !self.currentQuantity, onClick: () => self.addOrderLine(self.currentGtin, self.currentQuantity) }, h("ion-icon", { slot: "icon-only", name: "add-circle" }))));
    };
    switch (self.getType()) {
      case SHIPMENT_TYPE.ISSUED:
        return [
          getOrderReference(),
          getRequester(),
          getRequesterLocale(),
          getProductInput(),
          getQuantityInput(),
          getStatus()
        ];
      case SHIPMENT_TYPE.RECEIVED:
        return [
          getOrderReference(),
          getSender(),
          getSenderLocale(),
          getRequesterLocale(),
          getStatus()
        ];
    }
  }
  getCreate() {
    if (!this.isCreate())
      return;
    return [
      ...this.getInputs(),
      h("line-stock-manager", { lines: this.lines, "show-stock": true, "enable-actions": true, onSelectEvent: (evt) => this.selectOrderLine(evt), "stock-string": this.stockString, "no-stock-string": this.noStockString, "select-string": this.selectString, "remaining-string": this.remainingString, "order-missing-string": this.orderMissingString, "available-string": this.availableString, "unavailable-string": this.unavailableString, "confirmed-string": this.confirmedString, "confirm-all-string": this.confirmAllString, "reset-all-string": this.resetAllString })
    ];
  }
  getPostCreate() {
    if (this.isCreate())
      return;
    return this.getInputs();
  }
  getManage() {
    if (this.isCreate())
      return;
    return (h("line-stock-manager", { lines: this.lines, "show-stock": this.getType() === SHIPMENT_TYPE.RECEIVED, "enable-action": this.isCreate() && this.getType() === SHIPMENT_TYPE.ISSUED, "stock-string": this.stockString, "no-stock-string": this.noStockString, "select-string": this.selectString, "remaining-string": this.remainingString, "order-missing-string": this.orderMissingString, "available-string": this.availableString, "unavailable-string": this.unavailableString, "confirmed-string": this.confirmedString, "confirm-all-string": this.confirmAllString, "reset-all-string": this.resetAllString }));
  }
  getView() {
  }
  render() {
    if (!this.host.isConnected)
      return;
    return (h(Host, null, h("create-manage-view-layout", { "create-title-string": this.titleString, "manage-title-string": this.manageString, "back-string": this.backString, "create-string": this.createString, "clear-string": this.clearString, "icon-name": "layers", "is-create": this.isCreate(), onGoBackEvent: (evt) => this.navigateBack(evt), onCreateEvent: (evt) => this.create(evt) }, h("div", { slot: "create" }, this.getCreate()), h("div", { slot: "postcreate" }, this.getPostCreate()), h("div", { slot: "manage" }, this.getManage()), h("div", { slot: "view" })), h("pdm-barcode-scanner-controller", { "barcode-title": this.scanString })));
  }
  get element() { return getElement(this); }
  static get watchers() { return {
    "shipmentRef": ["refresh"],
    "orderJSON": ["refreshOrder"]
  }; }
};
__decorate([
  HostElement()
], ManagedShipment.prototype, "host", void 0);
ManagedShipment.style = managedShipmentCss;

export { ManagedShipment as managed_shipment };

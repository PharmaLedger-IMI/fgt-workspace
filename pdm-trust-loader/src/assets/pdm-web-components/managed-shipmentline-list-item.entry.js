import { r as registerInstance, e as createEvent, h, g as getElement } from './index-d0e12a29.js';
import { W as WebManagerService } from './WebManagerService-e3623754.js';
import { H as HostElement } from './index-3dd6e8f7.js';
import { w as wizard } from './WizardService-a462b2bc.js';
import { S as SUPPORTED_LOADERS } from './supported-loader-4cd02ac2.js';

const managedShipmentlineListItemCss = ":host{display:block;--background:inherit}ion-item.main-item{animation:1s linear fadein}ion-item.main-item ion-grid{width:100%}ion-col ion-label.ion-padding{padding-top:4px;padding-bottom:4px}managed-orderline-list-item ion-skeleton-text.label-name{width:50%}managed-orderline-list-item ion-skeleton-text.label-gtin{width:60%}managed-orderline-list-item ion-skeleton-text.label-requester{width:50%}managed-orderline-list-item ion-skeleton-text.label-date{width:80%}ion-chip{height:28px;--ion-padding:8px;--ion-margin:8px}@keyframes fadein{from{opacity:0}to{opacity:1}}";

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
const { ShipmentLine, Product, Batch, ShipmentStatus } = wizard.Model;
const ManagedOrderlineListItem = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendErrorEvent = createEvent(this, "ssapp-send-error", 7);
    this.sendNavigateTab = createEvent(this, "ssapp-navigate-tab", 7);
    this.gtinLabel = "Gtin:";
    this.batchLabel = "Batch:";
    this.nameLabel = "Name:";
    this.requesterLabel = "Requester:";
    this.senderLabel = "Sender:";
    this.createdOnLabel = "Created on:";
    this.statusLabel = "Status:";
    this.quantityLabel = "Quantity:";
    this.shipmentLineManager = undefined;
    this.productManager = undefined;
    this.batchManager = undefined;
    this.line = undefined;
    this.product = undefined;
    this.batch = undefined;
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
    this.shipmentLineManager = await WebManagerService.getWebManager("ShipmentLineManager");
    this.productManager = await WebManagerService.getWebManager("ProductManager");
    this.batchManager = await WebManagerService.getWebManager("BatchManager");
    return await this.loadOrderLine();
  }
  async loadOrderLine() {
    let self = this;
    if (!self.shipmentLineManager)
      return;
    self.shipmentLineManager.getOne(self.shipmentLine, true, (err, line) => {
      if (err) {
        self.sendError(`Could not get ShipmentLine with reference ${self.shipmentLine}`, err);
        return;
      }
      self.line = line;
      self.productManager.getOne(self.line.gtin, true, (err, product) => {
        if (err) {
          self.sendError(`Could not get Product data from ${self.line.gtin}`, err);
          return;
        }
        self.product = product;
        self.batchManager.getOne(`${self.line.gtin}-${self.line.batch}`, true, (err, batch) => {
          if (err) {
            self.sendError(`Could not get batch data from ${self.line.gtin}'s ${self.line.batch}`, err);
            return;
          }
          self.batch = batch;
        });
      });
    });
  }
  async refresh() {
    await this.loadOrderLine();
  }
  addBarCode() {
    const self = this;
    const getBarCode = function () {
      if (!self.line || !self.line.gtin)
        return (h("ion-skeleton-text", { animated: true }));
      return (h("barcode-generator", { class: "ion-align-self-center", type: "code128", size: "32", scale: "6", data: self.line.gtin }));
    };
    return (h("ion-thumbnail", { class: "ion-align-self-center bar-code", slot: "start" }, getBarCode()));
  }
  getPropsFromKey() {
    if (!this.shipmentLine)
      return undefined;
    const props = this.shipmentLine.split('-');
    return {
      requesterId: props[0],
      senderId: props[1],
      gtin: props[2],
      date: (new Date(parseInt(props[3]) * 1000)).toLocaleDateString("en-US")
    };
  }
  addProductColumn(props) {
    const self = this;
    const getNameLabel = function () {
      if (!self.product || !self.product.name)
        return (h("h4", null, h("ion-skeleton-text", { animated: true, class: "label-name" })));
      return (h("h4", null, self.product.name));
    };
    const getGtinLabel = function () {
      if (!props || !props.gtin)
        return (h("h3", null, h("ion-skeleton-text", { animated: true, class: "label-gtin" })));
      return (h("h3", null, props.gtin));
    };
    return [
      h("ion-label", { class: "ion-padding-horizontal ion-align-self-center", position: "stacked" }, h("p", null, self.gtinLabel)),
      h("ion-label", { class: "ion-padding ion-align-self-center" }, getGtinLabel()),
      h("ion-label", { class: "ion-padding-horizontal ion-align-self-center", position: "stacked" }, h("p", null, self.nameLabel)),
      h("ion-label", { class: "ion-padding ion-align-self-center" }, getNameLabel())
    ];
  }
  addRequesterColumn(props) {
    const self = this;
    const getRequesterLabel = function () {
      if (!props || !props.requesterId)
        return (h("h4", null, h("ion-skeleton-text", { animated: true, class: "label-requester" })));
      return (h("h4", null, props.requesterId));
    };
    const getDateLabel = function () {
      if (!props || !props.date)
        return (h("h4", null, h("ion-skeleton-text", { animated: true, class: "label-date" })));
      return (h("h4", null, props.date));
    };
    return [
      h("ion-label", { class: "ion-padding-horizontal ion-align-self-center", position: "stacked" }, h("p", null, self.requesterLabel)),
      h("ion-label", { class: "ion-padding ion-align-self-center" }, getRequesterLabel()),
      h("ion-label", { class: "ion-padding-horizontal ion-align-self-center", position: "stacked" }, h("p", null, self.createdOnLabel)),
      h("ion-label", { class: "ion-padding ion-align-self-center" }, getDateLabel())
    ];
  }
  addSenderColumn(props) {
    const self = this;
    const getSenderLabel = function () {
      if (!props || !props.senderId)
        return (h("h4", null, h("ion-skeleton-text", { animated: true, class: "label-sender" })));
      return (h("h4", null, props.senderId));
    };
    const getDateLabel = function () {
      if (!props || !props.date)
        return (h("h4", null, h("ion-skeleton-text", { animated: true, class: "label-date" })));
      return (h("h4", null, props.date));
    };
    return [
      h("ion-label", { class: "ion-padding-horizontal ion-align-self-center", position: "stacked" }, h("p", null, self.senderLabel)),
      h("ion-label", { class: "ion-padding ion-align-self-center" }, getSenderLabel()),
      h("ion-label", { class: "ion-padding-horizontal ion-align-self-center", position: "stacked" }, h("p", null, self.createdOnLabel)),
      h("ion-label", { class: "ion-padding ion-align-self-center" }, getDateLabel()),
    ];
  }
  addDetailsColumn() {
    const self = this;
    const getStatusBadge = function () {
      if (!self.line || !self.line.status)
        return (h("multi-loader", { class: "ion-float-start", type: SUPPORTED_LOADERS.bubblingSmall }));
      const getColorByStatus = function () {
        switch (self.line.status) {
          case ShipmentStatus.REJECTED:
            return 'danger';
          case ShipmentStatus.On_HOLD:
            return 'warning';
          case ShipmentStatus.CONFIRMED:
            return 'success';
          case ShipmentStatus.CREATED:
            return 'medium';
          case ShipmentStatus.ACKNOWLEDGED:
          case ShipmentStatus.TRANSIT:
          case ShipmentStatus.RECEIVED:
            return 'secondary';
          default:
            return 'primary';
        }
      };
      return (h("ion-badge", { color: getColorByStatus(), class: "ion-padding-horizontal ion-text-uppercase" }, self.line.status));
    };
    const getQuantityBadge = function () {
      if (!self.line || !self.line.quantity)
        return (h("multi-loader", { type: SUPPORTED_LOADERS.bubblingSmall }));
      return (h("ion-badge", { color: "primary", class: "ion-padding-horizontal ion-text-uppercase" }, self.line.quantity));
    };
    return [
      h("ion-label", { class: "ion-padding-horizontal ion-align-self-center", position: "stacked" }, h("p", null, self.statusLabel)),
      h("ion-label", { class: "ion-padding ion-align-self-center" }, getStatusBadge()),
      h("ion-label", { class: "ion-padding-horizontal ion-align-self-center", position: "stacked" }, h("p", null, self.quantityLabel)),
      h("ion-label", { class: "ion-padding ion-align-self-center" }, getQuantityBadge())
    ];
  }
  addButtons() {
    let self = this;
    const getButtons = function () {
      if (!self.line)
        return (h("ion-skeleton-text", { animated: true }));
      return (h("ion-button", { slot: "primary", onClick: () => self.navigateToTab('tab-batches', { shipmentLine: self.shipmentLine }) }, h("ion-icon", { name: "file-tray-stacked-outline" })));
    };
    return (h("ion-buttons", { class: "ion-align-self-center ion-padding", slot: "end" }, getButtons()));
  }
  render() {
    const props = this.getPropsFromKey();
    return (h("ion-item", { class: "ion-align-self-center main-item" }, this.addBarCode(), h("ion-grid", null, h("ion-row", null, h("ion-col", { size: "4" }, this.addProductColumn(props)), h("ion-col", { size: "3" }, this.addRequesterColumn(props)), h("ion-col", { size: "3" }, this.addSenderColumn(props)), h("ion-col", { size: "2" }, this.addDetailsColumn()))), this.addButtons()));
  }
  get element() { return getElement(this); }
  static get watchers() { return {
    "shipmentLine": ["refresh"]
  }; }
};
__decorate([
  HostElement()
], ManagedOrderlineListItem.prototype, "host", void 0);
ManagedOrderlineListItem.style = managedShipmentlineListItemCss;

export { ManagedOrderlineListItem as managed_shipmentline_list_item };

import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-d0e12a29.js';
import { W as WebManagerService } from './WebManagerService-82558d63.js';
import { H as HostElement } from './index-3dd6e8f7.js';
import { w as wizard } from './WizardService-462ec42a.js';
import { S as SUPPORTED_LOADERS } from './supported-loader-4cd02ac2.js';
import { g as getBarCodePopOver } from './popOverUtils-42d18ac5.js';

const managedShipmentlineListItemCss = ":host{display:block}ion-item.main-item{animation:1s linear fadein}@keyframes fadein{from{opacity:0}to{opacity:1}}";

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
const { ShipmentLine, Product, Batch } = wizard.Model;
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
    return await this.loadShipmentLine();
  }
  async loadShipmentLine() {
    let self = this;
    if (!self.shipmentLineManager || !self.shipmentLine)
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
    await this.loadShipmentLine();
  }
  getPropsFromKey() {
    if (!this.shipmentLine)
      return undefined;
    const props = this.shipmentLine.split('-');
    return {
      requesterId: props[0],
      senderId: props[1],
      gtin: props[2],
      createdOn: (new Date(parseInt(props[3]) * 1000)).toLocaleDateString("en-US")
    };
  }
  triggerSelect(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    console.log(`Selected ${evt.detail}`);
    const { gtin } = this.line;
    const { batchNumber } = this.batch;
    this.navigateToTab('tab-individual-product', {
      gtin: gtin,
      batchNumber: batchNumber,
      serialNumber: evt.detail
    });
  }
  addSerials() {
    if (!this.batch)
      return (h("multi-spinner", { slot: "content", type: SUPPORTED_LOADERS.bubblingSmall }));
    return (h("pdm-item-organizer", { slot: "content", "component-name": "generic-chip", "component-props": JSON.stringify(this.batch.serialNumbers.map(serial => ({
        "chip-label": serial,
        "class": "ion-margin-start"
      }))), "id-prop": "chip-label", "is-ion-item": "false", "display-count": "1", orientation: this.getOrientation(), onSelectEvent: this.triggerSelect.bind(this) }));
  }
  addDetails() {
    const props = this.getPropsFromKey();
    const buildLabelElement = (props) => {
      return (h("ion-col", null, h("ion-label", { color: "secondary" }, props)));
    };
    return (h("ion-col", { slot: "content", "size-md": "4", "size-lg": "3" }, h("ion-row", { className: "ion-align-items-center" }, buildLabelElement(props.requesterId), buildLabelElement(props.senderId))));
  }
  addLabel() {
    const props = this.getPropsFromKey();
    const self = this;
    const getBatchLabel = function () {
      if (!self.batch)
        return (h("ion-skeleton-text", { animated: true, className: "label-batch" }));
      return self.batch.batchNumber;
    };
    const getQuantityLabel = function () {
      if (!self.line)
        return (h("ion-skeleton-text", { animated: true, className: "label-quantity" }));
      return self.line.getQuantity();
    };
    const getStatusLabel = function () {
      if (!self.line)
        return (h("ion-skeleton-text", { animated: true, className: "label-status" }));
      return (h("ion-badge", null, self.line.status));
    };
    const buildLabelElement = (props) => {
      return (h("ion-col", { className: "ion-padding-start", size: "auto" }, h("ion-label", { color: "secondary" }, props)));
    };
    return (h("ion-col", { slot: "label", size: "3" }, h("ion-row", { class: "ion-align-items-center" }, buildLabelElement(props.gtin), buildLabelElement(getBatchLabel()), buildLabelElement(getQuantityLabel()), buildLabelElement(getStatusLabel()))));
  }
  getOrientation() {
    const layout = this.element.querySelector('list-item-layout');
    return layout ? layout.orientation : 'end';
  }
  addButtons() {
    let self = this;
    if (!self.shipmentLine)
      return (h("ion-skeleton-text", { animated: true }));
    const getButton = function (slot, color, icon, handler) {
      return (h("ion-button", { slot: slot, color: color, fill: "clear", onClick: handler }, h("ion-icon", { size: "large", slot: "icon-only", name: icon })));
    };
    return [
      getButton("buttons", "medium", "barcode", (evt) => getBarCodePopOver({
        type: "code128",
        size: "32",
        scale: "6",
        data: self.shipmentLine
      }, evt))
    ];
  }
  render() {
    if (!this.host.isConnected)
      return;
    return (h(Host, null, h("list-item-layout", null, this.addLabel(), this.addDetails(), this.addSerials(), this.addButtons())));
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

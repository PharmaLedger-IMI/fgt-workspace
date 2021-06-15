import { r as registerInstance, e as createEvent, h, g as getElement } from './index-21b82b33.js';
import { W as WebManagerService } from './WebManagerService-de8a473f.js';
import { S as SUPPORTED_LOADERS } from './supported-loader-4cd02ac2.js';
import { H as HostElement } from './index-993dbba1.js';
import './WizardService-c618738b.js';

const managedIssuedShipmentCss = ":host{display:block}managed-issued-shipment{--color:var(--ion-color-primary-contrast)}ion-card-title{color:var(--ion-color-primary)}ion-card-subtitle{color:var(--ion-color-secondary)}ion-item.selected{--color:var(--ion-color-success)}ion-item.unnecessary{--color:red}";

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
const ItemClasses = {
  selected: "selected",
  unnecessary: 'unnecessary',
  normal: 'normal',
  finished: 'finished'
};
// @ts-ignore
const { Order, OrderLine, Stock, Batch, Shipment, ShipmentStatus, ShipmentLine } = require('wizard').Model;
const ManagedIssuedShipment = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendErrorEvent = createEvent(this, "ssapp-send-error", 7);
    this.sendNavigateTab = createEvent(this, "ssapp-navigate-tab", 7);
    this.sendAcknowledgeEvent = createEvent(this, "acknowledged", 7);
    this.sendPickUpEvent = createEvent(this, "pickup", 7);
    this.sendRejectEvent = createEvent(this, "rejected", 7);
    this.shipmentId = undefined;
    this.titleString = 'Process Shipment';
    this.detailsString = 'Details:';
    this.productsString = 'Products:';
    this.availableString = 'Available:';
    this.unavailableString = 'Unavailable:';
    this.confirmedString = 'Confirmed:';
    this.stockString = 'Stock:';
    this.noStockString = 'Empty';
    this.selectProductString = 'Please Select a Product...';
    this.remainingString = 'Remaining:';
    this.rejectString = 'Reject';
    this.proceedString = 'Continue:';
    this.delayString = 'Delay:';
    this.shipment = undefined;
    this.orderLines = undefined;
    this.stockForProduct = undefined;
    this.selectedProduct = undefined;
    this.result = undefined;
    this.shipmentLines = {};
    this.issuedShipmentManager = undefined;
    this.stockManager = undefined;
  }
  sendError(message, err) {
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Product Component: ${message}`, err);
  }
  sendAction(action, props) {
    let handler;
    switch (action) {
      case ShipmentStatus.REJECTED:
        handler = this.sendRejectEvent;
        break;
      case ShipmentStatus.ACKNOWLEDGED:
        handler = this.sendAcknowledgeEvent;
        break;
      case ShipmentStatus.PICKUP:
        handler = this.sendPickUpEvent;
        break;
      default:
        return console.log(`invalid action`);
    }
    const event = handler.emit(this.buildShipment(Object.keys(props).reduce((accum, key) => {
      accum[key] = props[key].selected;
      return accum;
    }, {})));
    if (!event.defaultPrevented)
      console.log(`Action ${action} with props: ${props} not handled`);
  }
  buildShipment(props) {
    const self = this;
    const buildShipmentLine = function (batch) {
      return new ShipmentLine({
        gtin: props.gtin,
        quantity: batch.quantity,
        batch: batch.batchNumber,
        requesterId: self.shipment.requesterId
      });
    };
    const shipment = new Shipment(undefined, undefined, this.shipment.requesterId, undefined, this.shipment.shipToAddress);
    shipment.shipmentLines = Object.keys(props).map(gtin => props[gtin].map(b => buildShipmentLine(b)));
    return shipment;
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.issuedShipmentManager = await WebManagerService.getWebManager("IssuedShipmentManager");
    this.stockManager = await WebManagerService.getWebManager("StockManager");
    return await this.loadShipment();
  }
  async loadShipment() {
    let self = this;
    if (!this.shipmentId || this.shipmentId.startsWith('@')) // for webcardinal model compatibility
      return;
    self.issuedShipmentManager.getOne(this.shipmentId, true, async (err, shipment) => {
      if (err)
        return this.sendError(`Could not retrieve shipment ${self.shipmentId}`);
      self.shipment = shipment;
      self.loadShipmentLines((err, lines) => {
        if (err)
          return;
        lines.forEach(line => {
          self.updateStock(line.gtin, lines);
        });
      });
    });
  }
  recreateOrderLines(shipmentLines) {
    const byGtin = shipmentLines.reduce((accum, sl) => {
      (accum[sl['gtin']] = accum[sl['gtin']] || []).push(sl);
      return accum;
    }, {});
    return Object.keys(byGtin).map(gtin => {
      const quantity = byGtin[gtin].reduce((acc, sl) => acc + sl.quantity, 0);
      const requesterId = byGtin[gtin][0].requesterId;
      const senderId = byGtin[gtin][0].senderId;
      return new OrderLine(gtin, quantity, requesterId, senderId);
    });
  }
  loadShipmentLines(callback) {
    const self = this;
    const result = [];
    const shipmentLineIterator = function (linesCopy, callback) {
      const shipmentLine = linesCopy.shift();
      if (!shipmentLine)
        return callback(undefined, result);
      self.stockManager.getOne(shipmentLine.gtin, true, (err, stock) => {
        if (err) {
          console.log(`Could not retrieve stock for product ${shipmentLine.gtin}`);
          result.push({
            orderLine: shipmentLine,
            stock: undefined
          });
          return shipmentLineIterator(linesCopy, callback);
        }
        result.push({
          orderLine: shipmentLine,
          stock: new Stock(stock)
        });
        shipmentLineIterator(linesCopy, callback);
      });
    };
    shipmentLineIterator(self.recreateOrderLines(self.shipment.shipmentLines), (err, result) => {
      if (err)
        return console.log(err);
      self.result = result.sort((first, second) => {
        if (first.stock === second.stock)
          return 0;
        if (!!first.stock && !second.stock)
          return 1;
        if (!!second.stock && !first.stock)
          return -1;
        return first.stock.getQuantity() - second.stock.getQuantity();
      });
      self.orderLines = self.result.map(r => r.shipmentLine);
      if (callback)
        callback(undefined, self.shipment.shipmentLines);
    });
  }
  async refresh() {
    await this.loadShipment();
  }
  async selectProduct(newGtin, oldGtin) {
    if (!newGtin || oldGtin === newGtin)
      return;
    if (!!this.result.filter(r => r.orderLine.gtin === newGtin)[0].confirmed)
      return;
    this.stockForProduct = Object.assign({}, this.updateStock(newGtin));
  }
  async updateOrder(evt) {
    const self = this;
    const getDifference = function () {
      return (!!self.stockForProduct.divided ? 1 : 0) + (!!self.stockForProduct.remaining.length ? 1 : 0);
    };
    const newStock = self.stockForProduct.slice();
    const movedBatch = newStock.splice(evt.detail.from > self.stockForProduct.selected.length ? evt.detail.from - getDifference() : evt.detail.from, 1);
    self.stockForProduct = undefined;
    const result = [];
    if (evt.detail.to > 0)
      result.push(...newStock.slice(0, evt.detail.to));
    result.push(...movedBatch, ...newStock.slice(evt.detail.to, Number.MAX_VALUE));
    await evt.detail.complete();
    self.stockForProduct = [...result];
  }
  updateStock(gtin, shipmentLines) {
    const self = this;
    if (gtin in self.shipmentLines)
      return self.shipmentLines[gtin];
    if (!self.result)
      this.stockForProduct = {};
    const productStock = this.result.filter(r => r.orderLine.gtin === gtin);
    if (!productStock.length)
      self.stockForProduct = {};
    if (productStock.length !== 1)
      return self.sendError(`More than one stock reference received. should be impossible`);
    const result = productStock[0].stock.batches.sort((b1, b2) => {
      const date1 = new Date(b1.expiry).getTime();
      const date2 = new Date(b2.expiry).getTime();
      return date1 - date2;
    });
    self.shipmentLines[gtin] = self.splitStockByQuantity(result, gtin, shipmentLines);
    return self.shipmentLines[gtin];
  }
  getActionButtons() {
    const self = this;
    const getButton = function (action, color, text, enabled = true, margin = true, visible = true) {
      return (h("ion-button", { class: `${!visible ? 'ion-hide' : ''} ${!!margin ? 'ion-margin-horizontal' : ''}`, color: color, size: "small", fill: "outline", disabled: !enabled, onClick: () => self.sendAction(action, self.shipmentLines) }, h("ion-label", null, text)));
    };
    return (h("ion-buttons", { class: "ion-float-end ion-justify-content-end" }, getButton(ShipmentStatus.REJECTED, "danger", self.rejectString, true, false), getButton(ShipmentStatus.ON_HOLD, "warning", self.delayString, true, true, false), getButton(ShipmentStatus.CREATED, "success", self.proceedString, self.result && self.result.length === self.result.filter(r => r.orderLine.confirmed).length, false)));
  }
  getHeader() {
    return (h("ion-card-header", { class: "ion-padding" }, h("ion-card-title", null, this.titleString, this.getActionButtons()), h("ion-card-subtitle", null, this.shipmentId)));
  }
  getLoading(type = SUPPORTED_LOADERS.simple) {
    return (h("multi-loader", { type: type }));
  }
  getMap() {
    return (h("ion-thumbnail", null, h("ion-icon", { slot: "end", name: "map-outline" })));
  }
  getLocalizationInfo() {
    return (h("ion-item", { class: "ion-no-padding" }, h("ion-item", { class: "ion-no-padding" }, h("ion-label", null, this.shipment.shipToAddress)), this.getMap()));
  }
  splitStockByQuantity(stock, gtin, shipmentLines) {
    const self = this;
    let accum = 0;
    const result = {
      selected: [],
      divided: undefined,
      remaining: []
    };
    if (shipmentLines) {
      const getStockIndex = function (shipmentLine) {
        for (let stockIndex = 0; stockIndex < stock.length; stockIndex++) {
          if (stock[stockIndex].gtin === shipmentLine.gtin)
            return stockIndex;
        }
        return -1;
      };
      for (let slIndex = shipmentLines.length - 1; slIndex >= 0; slIndex--) {
        const sl = shipmentLines[slIndex];
        const stockIndex = getStockIndex(sl);
        if (stockIndex === -1) {
          // TODO handle missing stock (means other user has used up the stock)
          continue;
        }
        stock.unshift(stock.splice(stockIndex, 1));
      }
    }
    const requiredQuantity = self.result.filter(r => r.orderLine.gtin === gtin)[0].orderLine.quantity;
    stock.forEach(batch => {
      if (accum >= requiredQuantity) {
        result.remaining.push(batch);
        // @ts-ignore
      }
      else if (accum + batch.quantity > requiredQuantity) {
        const batch1 = new Batch(batch);
        const batch2 = new Batch(batch);
        batch1.quantity = requiredQuantity - accum;
        // @ts-ignore
        batch2.quantity = batch.quantity - batch1.quantity;
        result.selected.push(batch1);
        result.divided = batch2;
      }
      else if (accum + batch.quantity === requiredQuantity) {
        result.selected.push(batch);
      }
      else {
        result.selected.push(batch);
      }
      // @ts-ignore
      accum += batch.quantity;
    });
    return result;
  }
  getAvailableStock() {
    const self = this;
    const getEmpty = function () {
      return (h("ion-item", null, h("ion-label", null, self.noStockString)));
    };
    const getSelectProduct = function () {
      return (h("ion-item", null, h("ion-label", null, self.selectProductString)));
    };
    const getBatchSeparator = function () {
      return (h("ion-item-divider", null, h("ion-label", { class: "ion-padding-horizontal" }, self.remainingString)));
    };
    const getBatch = function (batch, status = ItemClasses.normal) {
      const getReorder = function () {
        if (status === ItemClasses.unnecessary)
          return;
        return (h("ion-reorder", { slot: "end" }, h("ion-icon", { name: "menu-outline" })));
      };
      return (h("ion-item", { class: status, disabled: status === ItemClasses.unnecessary }, h("batch-chip", { "gtin-batch": self.selectedProduct + '-' + batch.batchNumber, mode: "detail", quantity: batch.quantity }), getReorder()));
    };
    if (!self.selectedProduct)
      return getSelectProduct();
    if (!self.stockForProduct)
      return self.getLoading(SUPPORTED_LOADERS.cube);
    if (self.stockForProduct.selected.length + self.stockForProduct.remaining.length + (self.stockForProduct.divided ? 1 : 0) === 0)
      return getEmpty();
    return (h("ion-reorder-group", { disabled: false }, this.stockForProduct.selected.map(s => getBatch(s, ItemClasses.selected)), !!this.stockForProduct.divided || !!this.stockForProduct.remaining.length ? getBatchSeparator() : '', getBatch(this.stockForProduct.divided, ItemClasses.unnecessary), this.stockForProduct.remaining.map(r => getBatch(r, ItemClasses.normal))));
  }
  async selectOrderLine(gtin) {
    this.selectedProduct = gtin;
  }
  getDetails() {
    if (!this.shipment)
      return this.getLoading();
    return this.getLocalizationInfo();
  }
  markProductAsConfirmed(gtin, confirmed = true) {
    let orderLine = this.result.filter(r => r.orderLine.gtin === gtin);
    if (orderLine.length !== 1)
      return;
    orderLine = orderLine[0].orderLine;
    this.updateStock(gtin);
    // @ts-ignore
    orderLine.confirmed = confirmed;
    this.selectedProduct = undefined;
    this.orderLines = this.result.map(r => r.orderLine);
  }
  markAllAsConfirmed(confirm = true) {
    if (confirm) {
      const available = this.result.filter(r => r.orderLine.quantity <= r.stock.getQuantity() && !r.orderLine.confirmed);
      if (!available.length)
        return;
      available.forEach(a => {
        this.updateStock(a.orderLine.gtin);
        a.orderLine.confirmed = true;
      });
    }
    else {
      const confirmed = this.result.filter(r => !!r.orderLine.confirmed);
      if (!confirmed.length)
        return;
      confirmed.forEach(c => c.orderLine.confirmed = false);
    }
    this.selectedProduct = undefined;
    this.orderLines = this.result.map(r => r.orderLine);
  }
  getOrderLines() {
    const self = this;
    if (!self.orderLines)
      return [self.getLoading(SUPPORTED_LOADERS.medical)];
    const genOrderLine = function (orderLine, available) {
      const getButton = function () {
        if (orderLine.gtin !== self.selectedProduct)
          return undefined;
        return {
          button: !!orderLine.confirmed ? "cancel" : "confirm"
        };
      };
      const receiveAction = function (evt) {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        const { gtin, action } = evt.detail.data;
        self.markProductAsConfirmed(gtin, action === "confirm");
      };
      return (h("managed-orderline-stock-chip", Object.assign({ onSendAction: receiveAction, onClick: () => self.selectOrderLine(orderLine.gtin), gtin: orderLine.gtin, quantity: orderLine.quantity, mode: "detail", available: available }, getButton())));
    };
    function getUnavailable() {
      const unavailable = self.result.filter(r => r.orderLine.quantity > r.stock.getQuantity() && !r.orderLine.confirmed);
      if (!unavailable.length)
        return [];
      const getHeader = function () {
        return (h("ion-item-divider", null, self.unavailableString));
      };
      const output = [getHeader()];
      unavailable.forEach(u => output.push(genOrderLine(u.orderLine, u.stock.getQuantity())));
      return output;
    }
    function getAvailable() {
      const available = self.result.filter(r => r.orderLine.quantity <= r.stock.getQuantity() && !r.orderLine.confirmed);
      if (!available.length)
        return [];
      const getHeader = function () {
        return (h("ion-item-divider", null, self.availableString, h("ion-button", { color: "success", slot: "end", fill: "clear", size: "small", class: "ion-float-end", onClick: () => self.markAllAsConfirmed() }, h("ion-icon", { slot: "icon-only", name: "checkmark-circle-outline" }))));
      };
      const output = [getHeader()];
      available.forEach(u => output.push(genOrderLine(u.orderLine, u.stock.getQuantity())));
      return output;
    }
    function getConfirmed() {
      const confirmed = self.result.filter(r => !!r.orderLine.confirmed);
      if (!confirmed.length)
        return [];
      const getHeader = function () {
        return (h("ion-item-divider", null, self.confirmedString, h("ion-button", { color: "danger", slot: "end", fill: "clear", size: "small", class: "ion-float-end", onClick: () => self.markAllAsConfirmed(false) }, h("ion-icon", { slot: "icon-only", name: "close-circle-outline" }))));
      };
      const output = [getHeader()];
      confirmed.forEach(u => output.push(genOrderLine(u.orderLine, u.stock.getQuantity())));
      return output;
    }
    return [...getUnavailable(), ...getAvailable(), ...getConfirmed()];
  }
  render() {
    return (h("ion-card", { class: "ion-margin" }, this.getHeader(), h("ion-card-content", null, h("ion-item-divider", null, h("ion-label", null, this.detailsString)), this.getDetails(), h("ion-grid", null, h("ion-row", null, h("ion-col", { size: "6" }, h("ion-item-group", null, h("ion-item-divider", null, h("ion-label", null, this.productsString)), this.getOrderLines())), h("ion-col", { size: "6" }, h("ion-item-group", null, h("ion-item-divider", { class: "ion-padding-horizontal" }, h("ion-label", null, this.stockString)), this.getAvailableStock())))))));
  }
  get element() { return getElement(this); }
  static get watchers() { return {
    "shipmentId": ["refresh"],
    "selectedProduct": ["selectProduct"]
  }; }
};
__decorate([
  HostElement()
], ManagedIssuedShipment.prototype, "host", void 0);
ManagedIssuedShipment.style = managedIssuedShipmentCss;

export { ManagedIssuedShipment as managed_issued_shipment };

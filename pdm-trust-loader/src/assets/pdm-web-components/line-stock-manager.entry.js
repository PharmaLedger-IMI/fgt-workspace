import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-21b82b33.js';
import { S as SUPPORTED_LOADERS } from './supported-loader-4cd02ac2.js';
import { H as HostElement } from './index-993dbba1.js';
import { W as WebManagerService } from './WebManagerService-65b4b71c.js';
import { w as wizard } from './WizardService-2f7a45ff.js';

const lineStockManagerCss = ":host{display:block}orderline-stock-manager ion-grid{width:100%}";

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
const { Stock, Batch } = wizard.Model;
const LineStockManager = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendErrorEvent = createEvent(this, "ssapp-send-error", 7);
    this.sendNavigateTab = createEvent(this, "ssapp-navigate-tab", 7);
    this.selectEvent = createEvent(this, "selectEvent", 7);
    this.lines = undefined;
    this.showStock = false;
    this.enableActions = false;
    // Strings
    this.linesString = 'Lines:';
    this.stockString = 'Stock:';
    this.noStockString = 'Empty';
    this.selectString = 'Please Select an Item...';
    this.remainingString = 'Remaining:';
    this.orderMissingString = 'Order Missing';
    this.availableString = 'Available:';
    this.unavailableString = 'Unavailable:';
    this.confirmedString = 'Confirmed:';
    this.confirmAllString = 'Confirm All';
    this.resetAllString = 'Reset All';
    this.stockManager = undefined;
    this.stockForProduct = undefined;
    this.selectedProduct = undefined;
    this.result = [];
    this.shipmentLines = {};
  }
  sendError(message, err) {
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Orderline Stock Manager Component: ${message}`, err);
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
    if (!this.showStock)
      return;
    this.stockManager = await WebManagerService.getWebManager("StockManager");
    await this.loadStockForOrderLines();
  }
  async reset() {
    this.result = [];
    this.shipmentLines = {};
    this.stockForProduct = undefined;
    this.selectedProduct = undefined;
  }
  async getResult() {
    return this.result;
  }
  async refresh(newVal) {
    if (typeof newVal !== 'string')
      await this.loadStockForOrderLines();
  }
  async loadStockManager(newVal) {
    if (typeof newVal === 'boolean' && newVal)
      this.stockManager = this.stockManager || await WebManagerService.getWebManager("StockManager");
  }
  async selectProduct(newGtin, oldGtin) {
    if (!newGtin || oldGtin === newGtin)
      return;
    if (!this.showStock)
      return;
    if (!!this.result.filter(r => r.orderLine.gtin === newGtin)[0].confirmed)
      return;
    this.stockForProduct = Object.assign({}, this.updateStock(newGtin));
  }
  loadStockForOrderLines() {
    const self = this;
    if (!self.stockManager)
      return;
    if (!self.lines || typeof self.lines === 'string' || !self.lines.length)
      return self.reset();
    const result = [];
    const orderLineIterator = function (orderLinesCopy, callback) {
      const orderLine = orderLinesCopy.shift();
      if (!orderLine)
        return callback(undefined, result);
      self.stockManager.getOne(orderLine.gtin, true, (err, stock) => {
        if (err) {
          console.log(`Could not retrieve stock for product ${orderLine.gtin}`);
          result.push({
            orderLine: orderLine,
            stock: undefined
          });
          return orderLineIterator(orderLinesCopy, callback);
        }
        result.push({
          orderLine: orderLine,
          stock: new Stock(stock)
        });
        orderLineIterator(orderLinesCopy, callback);
      });
    };
    orderLineIterator(self.lines.slice(), (err, result) => {
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
    });
  }
  getLoading(type = SUPPORTED_LOADERS.simple) {
    return (h("multi-loader", { type: type }));
  }
  selectLine(gtin) {
    this.selectEvent.emit(gtin);
    this.selectedProduct = gtin;
  }
  async cancelLine(gtin) {
    if (gtin) {
      if (!this.lines)
        return;
      let index;
      this.lines.every((ol, i) => {
        if (ol.gtin !== gtin)
          return true;
        index = i;
        return false;
      });
      if (index === undefined)
        return;
      this.lines.splice(index, 1);
      this.lines = [...this.lines];
    }
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
  updateStock(gtin) {
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
    const result = productStock[0].stock ? productStock[0].stock.batches.sort((b1, b2) => {
      const date1 = new Date(b1.expiry).getTime();
      const date2 = new Date(b2.expiry).getTime();
      return date1 - date2;
    }) : [];
    self.shipmentLines[gtin] = self.splitStockByQuantity(result, gtin);
    return self.shipmentLines[gtin];
  }
  splitStockByQuantity(stock, gtin) {
    const self = this;
    let accum = 0;
    const result = {
      selected: [],
      divided: undefined,
      remaining: []
    };
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
    const getStockHeader = function () {
      return (h("ion-item-divider", { class: "ion-margin-bottom" }, self.stockString));
    };
    const getEmpty = function () {
      return (h("ion-label", { color: "medium" }, self.noStockString));
    };
    const getSelectProduct = function () {
      return (h("ion-label", { color: "medium" }, self.selectString));
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
      return [getStockHeader(), getSelectProduct()];
    if (!self.stockForProduct)
      return [getStockHeader(), self.getLoading(SUPPORTED_LOADERS.bubbling)];
    if (self.stockForProduct.selected.length + self.stockForProduct.remaining.length + (self.stockForProduct.divided ? 1 : 0) === 0)
      return [getStockHeader(), getEmpty()];
    return [
      getStockHeader(),
      h("ion-reorder-group", { disabled: false }, this.stockForProduct.selected.map(s => getBatch(s, ItemClasses.selected)), !!this.stockForProduct.divided || !!this.stockForProduct.remaining.length ? getBatchSeparator() : '', !!this.stockForProduct.divided ? getBatch(this.stockForProduct.divided, ItemClasses.unnecessary) : '', this.stockForProduct.remaining.map(r => getBatch(r, ItemClasses.normal)))
    ];
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
    this.lines = this.result.map(r => r.orderLine);
  }
  markAllAsConfirmed(confirm = true) {
    if (confirm) {
      const available = this.result.filter(r => r.stock && r.orderLine.quantity <= r.stock.getQuantity() && !r.orderLine.confirmed);
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
    this.selectLine(undefined);
    this.lines = this.result.map(r => r.orderLine);
  }
  genLine(orderLine, available) {
    const self = this;
    const getButton = function () {
      if (!self.enableActions || orderLine.gtin !== self.selectedProduct)
        return undefined;
      return {
        button: !!orderLine.confirmed && available < orderLine.quantity ? "cancel" : "confirm"
      };
    };
    const receiveAction = function (evt) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      const { gtin, action } = evt.detail.data;
      if (action === 'cancel')
        return self.cancelLine(gtin);
      self.markProductAsConfirmed(gtin, action === "confirm");
    };
    return (h("managed-orderline-stock-chip", Object.assign({ onSendAction: receiveAction, onClick: () => self.selectLine(orderLine.gtin), gtin: orderLine.gtin, quantity: orderLine.quantity, mode: "detail", available: available || undefined }, getButton())));
  }
  getOrderLines() {
    const self = this;
    if (!self.result)
      return [self.getLoading(SUPPORTED_LOADERS.cube)];
    function getUnavailable() {
      const unavailable = self.result.filter(r => (!r.stock || r.orderLine.quantity > r.stock.getQuantity()) && !r.orderLine.confirmed);
      if (!unavailable.length)
        return [];
      const getHeader = function () {
        return (h("ion-item-divider", { class: "ion-margin-bottom" }, self.unavailableString, h("ion-button", { color: "primary", slot: "end", fill: "clear", size: "small", class: "ion-float-end", onClick: () => self.navigateToTab('tab-order', {
            mode: "issued",
            orderLines: unavailable.map(u => JSON.parse(JSON.stringify(u.orderLine)))
          }) }, self.orderMissingString, h("ion-icon", { slot: "end", name: "checkmark-circle" }))));
      };
      const output = [getHeader()];
      unavailable.forEach(u => output.push(self.genLine(u.orderLine, u.stock ? u.stock.getQuantity() : 0)));
      return output;
    }
    function getAvailable() {
      const available = self.result.filter(r => r.stock && r.orderLine.quantity <= r.stock.getQuantity() && !r.orderLine.confirmed);
      if (!available.length)
        return [];
      const getHeader = function () {
        return (h("ion-item-divider", { class: "ion-margin-bottom" }, self.availableString, h("ion-button", { color: "success", slot: "end", fill: "clear", size: "small", class: "ion-float-end", onClick: () => self.markAllAsConfirmed() }, self.confirmAllString, h("ion-icon", { slot: "end", name: "checkmark-circle" }))));
      };
      const output = [getHeader()];
      available.forEach(u => output.push(self.genLine(u.orderLine, u.stock ? u.stock.getQuantity() : 0)));
      return output;
    }
    function getConfirmed() {
      const confirmed = self.result.filter(r => !!r.orderLine.confirmed);
      if (!confirmed.length)
        return [];
      const getHeader = function () {
        return (h("ion-item-divider", { class: "ion-margin-bottom" }, self.confirmedString, h("ion-button", { color: "danger", slot: "end", fill: "clear", size: "small", class: "ion-float-end", onClick: () => self.markAllAsConfirmed(false) }, self.resetAllString, h("ion-icon", { slot: "end", name: "close-circle" }))));
      };
      const output = [getHeader()];
      confirmed.forEach(u => output.push(self.genLine(u.orderLine, u.stock ? u.stock.getQuantity() : 0)));
      return output;
    }
    return [...getUnavailable(), ...getAvailable(), ...getConfirmed()];
  }
  getSimpleOrderLines() {
    const self = this;
    if (!self.lines)
      return [];
    return self.lines.map(u => self.genLine(u.orderLine || u));
  }
  getMainHeader() {
    return (h("ion-item-divider", null, this.linesString));
  }
  isReady() {
    return typeof this.lines !== 'string';
  }
  getContent() {
    const content = [h("ion-col", { size: this.showStock ? "6" : "12" }, this.showStock ? this.getOrderLines() : this.getSimpleOrderLines())];
    if (this.showStock)
      content.push(h("ion-col", { size: "6" }, this.getAvailableStock()));
    return content;
  }
  render() {
    if (!this.host.isConnected)
      return;
    return (h(Host, null, h("ion-grid", null, h("ion-row", null, this.getMainHeader()), h("ion-row", null, !this.isReady() ? this.getLoading('circles') : this.getContent()))));
  }
  get element() { return getElement(this); }
  static get watchers() { return {
    "lines": ["refresh"],
    "showStock": ["loadStockManager"],
    "selectedProduct": ["selectProduct"]
  }; }
};
__decorate([
  HostElement()
], LineStockManager.prototype, "host", void 0);
LineStockManager.style = lineStockManagerCss;

export { LineStockManager as line_stock_manager };

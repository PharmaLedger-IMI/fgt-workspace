import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-21b82b33.js';
import { H as HostElement } from './index-993dbba1.js';
import { W as WebManagerService } from './WebManagerService-de8a473f.js';
import { w as wizard } from './WizardService-c618738b.js';
import { S as SUPPORTED_LOADERS } from './supported-loader-4cd02ac2.js';
import { F as FALLBACK_COLOR, g as getSteppedColor } from './colorUtils-62f7f6b9.js';

const managedOrderlineStockChipCss = ":host{display:inherit}managed-orderline-stock-chip{--color-step:var(--ion-color-primary);animation:0.5s linear fadein}ion-badge{background-color:var(--color-step)}ion-chip{height:28px;--ion-padding:8px;--ion-margin:8px}@keyframes fadein{from{opacity:0}to{opacity:1}}";

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
const { Stock } = wizard.Model;
const CHIP_TYPE = {
  SIMPLE: "simple",
  DETAIL: "detail"
};
const AVAILABLE_BUTTONS = {
  CONFIRM: "confirm",
  CANCEL: "cancel"
};
const ManagedOrderlineStockChip = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendAction = createEvent(this, "sendAction", 7);
    this.gtin = undefined;
    this.quantity = undefined;
    this.available = undefined;
    this.mode = CHIP_TYPE.SIMPLE;
    this.loaderType = SUPPORTED_LOADERS.bubblingSmall;
    this.threshold = 30;
    this.button = undefined;
    this.stockManager = undefined;
    this.productManager = undefined;
    this.stock = undefined;
    this.expiry = undefined;
  }
  sendActionEvent() {
    const event = this.sendAction.emit({
      data: {
        action: this.button,
        gtin: this.gtin
      }
    });
    if (!event.defaultPrevented)
      console.log(`Ignored action: ${this.button} for gtin: ${this.gtin}`);
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    if (this.mode !== CHIP_TYPE.DETAIL || !!this.available)
      return;
    this.stockManager = await WebManagerService.getWebManager("StockManager");
    this.productManager = await WebManagerService.getWebManager("ProductManager");
    return await this.loadBatch();
  }
  async loadBatch() {
    if (this.mode !== CHIP_TYPE.DETAIL)
      return;
    const self = this;
    self.stockManager.getOne(this.gtin, true, (err, stock) => {
      if (err) {
        console.log(`Could nor read batch information for ${self.gtin}. presuming empty. Getting product info...`);
        return self.productManager.getOne(this.gtin, true, (err, product) => {
          if (err) {
            console.log(`Could not resolver product. does it exist?`);
            self.stock = new Stock(product);
          }
          else {
            self.stock = new Stock(product);
          }
        });
      }
      self.stock = new Stock(stock);
    });
  }
  renderSimple() {
    return (h(Host, null, h("generic-chip", { "chip-label": this.gtin, outline: true }, this.renderQuantity())));
  }
  renderQuantity() {
    if (!this.quantity && this.quantity !== 0)
      return;
    return (h("ion-badge", { slot: "badges" }, this.quantity));
  }
  getColor() {
    if (!this.stock && !this.available)
      return `var(${FALLBACK_COLOR})`;
    return `var(${getSteppedColor(this.threshold, this.quantity, this.available ? this.available : this.stock.getQuantity())})`;
  }
  renderButton() {
    if (!this.button)
      return;
    let props;
    switch (this.button) {
      case AVAILABLE_BUTTONS.CONFIRM:
        props = {
          color: "success",
          iconName: "checkmark-circle-outline",
          disabled: this.available && this.available > 0
        };
        break;
      case AVAILABLE_BUTTONS.CANCEL:
        props = {
          color: "danger",
          iconName: "close-circle-outline",
          disabled: false
        };
        break;
      default:
        return;
    }
    return (h("ion-button", { slot: "buttons", fill: "clear", size: "small", color: props.color, onClick: () => this.sendActionEvent(), disabled: props.disabled }, h("ion-icon", { slot: "icon-only", name: props.iconName })));
  }
  renderDetail() {
    return (h(Host, null, h("generic-chip", { style: {
        "--color-step": this.getColor()
      }, "chip-label": this.gtin, outline: true }, this.renderQuantity(), this.renderButton())));
  }
  render() {
    if (!this.host.isConnected)
      return;
    switch (this.mode) {
      case CHIP_TYPE.SIMPLE:
        return this.renderSimple();
      case CHIP_TYPE.DETAIL:
        return this.renderDetail();
    }
  }
  get element() { return getElement(this); }
};
__decorate([
  HostElement()
], ManagedOrderlineStockChip.prototype, "host", void 0);
ManagedOrderlineStockChip.style = managedOrderlineStockChipCss;

export { ManagedOrderlineStockChip as managed_orderline_stock_chip };

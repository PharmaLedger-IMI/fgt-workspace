import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-d0e12a29.js';
import { H as HostElement } from './index-3dd6e8f7.js';
import { W as WebManagerService } from './WebManagerService-82558d63.js';
import { S as SUPPORTED_LOADERS } from './supported-loader-4cd02ac2.js';
import { c as calculateDiffInDays, g as getSteppedColor } from './colorUtils-1e9fd55f.js';
import './WizardService-462ec42a.js';

const batchChipCss = ":host{display:inherit}batch-chip{--color-step:var(--ion-color-primary)}";

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
const Batch = require('wizard').Model.Batch;
const CHIP_TYPE = {
  SIMPLE: "simple",
  DETAIL: "detail"
};
const BatchChip = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.selectEvent = createEvent(this, "selectEvent", 7);
    this.gtinBatch = undefined;
    this.quantity = undefined;
    this.mode = CHIP_TYPE.SIMPLE;
    this.loaderType = SUPPORTED_LOADERS.circles;
    this.expiryThreshold = 30;
    this.batchResolver = undefined;
    this.batch = undefined;
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    if (this.mode !== CHIP_TYPE.DETAIL)
      return;
    this.batchResolver = await WebManagerService.getWebManager("BatchManager");
    return await this.loadBatch();
  }
  async loadBatch() {
    if (!this.host.isConnected)
      return;
    if (this.mode !== CHIP_TYPE.DETAIL)
      return;
    this.batchResolver.getOne(this.gtinBatch, true, (err, batch) => {
      if (err)
        return console.log(`Could nor read batch information for ${this.gtinBatch}`);
      this.batch = batch;
    });
  }
  getBatchNumber() {
    return this.gtinBatch.split('-')[1];
  }
  renderExpiryInfo() {
    if (!this.batch)
      return (h("multi-spinner", { type: this.loaderType }));
    const self = this;
    const getDaysTillExpiryString = function () {
      const daysLeft = calculateDiffInDays(new Date(self.batch.expiry), new Date());
      if (daysLeft <= 0)
        return '-';
      return `${daysLeft}d`;
    };
    return (h("ion-badge", { slot: "badges", style: {
        "--color-step": `var(${getSteppedColor(this.expiryThreshold, this.batch.expiry, new Date())})`
      } }, getDaysTillExpiryString()));
  }
  renderSimple() {
    const self = this;
    return (h(Host, null, h("generic-chip", { "chip-label": this.getBatchNumber(), outline: true, color: "secondary", onSelectEvent: self.triggerSelect.bind(self) }, self.renderQuantity())));
  }
  renderQuantity() {
    if (!this.quantity && this.quantity !== 0)
      return;
    return (h("ion-badge", { slot: "badges", color: "tertiary" }, this.quantity));
  }
  triggerSelect(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.selectEvent.emit(this.gtinBatch);
  }
  renderDetail() {
    const self = this;
    return (h(Host, null, h("generic-chip", { "chip-label": this.getBatchNumber(), outline: true, color: "secondary", onSelectEvent: self.triggerSelect.bind(self) }, self.renderExpiryInfo(), self.renderQuantity())));
  }
  render() {
    switch (this.mode) {
      case CHIP_TYPE.SIMPLE:
        return this.renderSimple();
      case CHIP_TYPE.DETAIL:
        return this.renderDetail();
    }
  }
  get element() { return getElement(this); }
  static get watchers() { return {
    "gtinBatch": ["loadBatch"]
  }; }
};
__decorate([
  HostElement()
], BatchChip.prototype, "host", void 0);
BatchChip.style = batchChipCss;

export { BatchChip as batch_chip };

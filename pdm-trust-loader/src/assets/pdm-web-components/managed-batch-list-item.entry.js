import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-d0e12a29.js';
import { W as WebManagerService } from './WebManagerService-e3623754.js';
import { H as HostElement } from './index-3dd6e8f7.js';
import { w as wizard } from './WizardService-a462b2bc.js';
import { S as SUPPORTED_LOADERS } from './supported-loader-4cd02ac2.js';
import { g as getBarCodePopOver } from './popOverUtils-2abe6b65.js';

const managedBatchListItemCss = ":host{display:block}ion-item.main-item{animation:1s linear fadein}@keyframes fadein{from{opacity:0}to{opacity:1}}";

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
const Batch = wizard.Model.Batch;
const ManagedBatchListItem = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendErrorEvent = createEvent(this, "ssapp-send-error", 7);
    this.sendNavigateTab = createEvent(this, "ssapp-navigate-tab", 7);
    this.batchManager = undefined;
    this.batch = undefined;
    this.serialNumbers = undefined;
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
    this.batchManager = await WebManagerService.getWebManager("BatchManager");
    return await this.loadBatch();
  }
  async loadBatch() {
    let self = this;
    if (!self.batchManager)
      return;
    self.batchManager.getOne(this.gtinBatch, true, (err, batch) => {
      if (err) {
        self.sendError(`Could not get Batch with code ${self.gtinBatch}`, err);
        return;
      }
      this.batch = new Batch(batch);
      this.serialNumbers = batch.serialNumbers;
    });
  }
  async refresh() {
    await this.loadBatch();
  }
  getGtinAndBatchNumber() {
    const props = this.gtinBatch.split('-');
    return {
      gtin: props[0],
      batchNumber: props[1]
    };
  }
  triggerSelect(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    console.log(`Selected ${evt.detail}`);
  }
  addLabel() {
    const self = this;
    const getBatchNumberLabel = function () {
      const batchNumber = self.getGtinAndBatchNumber().batchNumber;
      if (!self.gtinBatch)
        return (h("ion-skeleton-text", { animated: true }));
      return batchNumber;
    };
    const getExpiryLabel = function () {
      if (!self.batch || !self.batch.expiry)
        return (h("ion-skeleton-text", { animated: true }));
      return self.batch.expiry;
    };
    return (h("ion-label", { slot: "label", color: "secondary" }, getBatchNumberLabel(), h("span", { class: "ion-padding-start" }, getExpiryLabel())));
  }
  addSerialsNumbers() {
    if (!this.serialNumbers || !this.batch)
      return (h("multi-spinner", { slot: "content", type: SUPPORTED_LOADERS.bubblingSmall }));
    return (h("pdm-item-organizer", { slot: "content", "component-name": "generic-chip", "component-props": JSON.stringify(this.batch.serialNumbers.map(serial => ({
        "chip-label": serial,
        "class": "ion-margin-start"
      }))), "id-prop": "chip-label", "is-ion-item": "false", orientation: this.getOrientation(), onSelectEvent: this.triggerSelect.bind(this) }));
  }
  getOrientation() {
    const layoutEl = this.element.querySelector('list-item-layout');
    return layoutEl ? layoutEl.orientation : 'end';
  }
  addButtons() {
    let self = this;
    const getButton = function (slot, color, icon, handler) {
      if (!self.batch)
        return (h("ion-skeleton-text", { animated: true }));
      return (h("ion-button", { slot: slot, color: color, fill: "clear", onClick: handler }, h("ion-icon", { size: "large", slot: "icon-only", name: icon })));
    };
    return [
      getButton("buttons", "medium", "barcode", (evt) => getBarCodePopOver({
        type: "gs1datamatrix",
        size: "32",
        scale: "6",
        data: self.batch.generate2DMatrixCode(self.getGtinAndBatchNumber().gtin)
      }, evt)),
      getButton("buttons", "medium", "eye", () => self.navigateToTab('tab-batch', {
        gtin: self.getGtinAndBatchNumber().gtin,
        batchNumber: self.getGtinAndBatchNumber().batchNumber
      }))
    ];
  }
  render() {
    return (h(Host, null, h("list-item-layout", null, this.addLabel(), this.addSerialsNumbers(), this.addButtons())));
  }
  get element() { return getElement(this); }
  static get watchers() { return {
    "gtinBatch": ["refresh"]
  }; }
};
__decorate([
  HostElement()
], ManagedBatchListItem.prototype, "host", void 0);
ManagedBatchListItem.style = managedBatchListItemCss;

export { ManagedBatchListItem as managed_batch_list_item };

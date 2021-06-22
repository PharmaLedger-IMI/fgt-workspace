import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-d0e12a29.js';
import { H as HostElement } from './index-3dd6e8f7.js';
import { w as wizard } from './WizardService-a462b2bc.js';
import { W as WebManagerService } from './WebManagerService-e3623754.js';
import { g as getBarCodePopOver } from './popOverUtils-2abe6b65.js';

const managedBatchCss = ":host{display:block}";

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
const { generateBatchNumber } = wizard.Model.utils;
const Batch = wizard.Model.Batch;
const ManagedBatch = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendErrorEvent = createEvent(this, "ssapp-send-error", 7);
    this.sendNavigateTab = createEvent(this, "ssapp-navigate-tab", 7);
    this.sendCreateAction = createEvent(this, "ssapp-action", 7);
    this.gtinRef = undefined;
    // strings
    this.titleString = "Create Batch for";
    this.manageString = "Manage Batch";
    this.backString = "Back to Product";
    this.batchNumberString = "Batch Number:";
    this.expiryString = "Expiry:";
    this.expiryPlaceholderString = "Please define an expiry date...";
    this.serialsString = "Serial Numbers:";
    this.serialsPlaceholderString = "Please insert comma separated serial numbers...";
    this.addBatchString = "Add Batch";
    this.clearString = "Clear";
    this.batchManager = undefined;
    this.batch = undefined;
    this.serialsNumbers = undefined;
    this.layoutComponent = undefined;
  }
  sendError(message, err) {
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Batch Component: ${message}`, err);
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
    await this.load();
  }
  getGtinBatch() {
    if (!this.gtinRef || this.gtinRef.startsWith('@'))
      return;
    const split = this.gtinRef.split('-');
    return {
      gtin: split[0],
      batchNumber: split[1]
    };
  }
  async load() {
    let self = this;
    if (!self.batchManager)
      return;
    if (this.isCreate()) {
      this.batch = undefined;
      this.serialsNumbers = undefined;
      return;
    }
    self.batchManager.getOne(self.gtinRef, true, (err, batch) => {
      if (err) {
        self.sendError(`Could not get Batch ${self.getGtinBatch().batchNumber} for gtin ${self.getGtinBatch().gtin}`, err);
        return;
      }
      this.batch = batch;
      this.serialsNumbers = [...this.batch.serialNumbers];
    });
  }
  async componentDidRender() {
    this.layoutComponent = this.layoutComponent || this.element.querySelector(`create-manage-view-layout`);
  }
  async refresh() {
    await this.load();
  }
  async reset() {
  }
  navigateBack(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.navigateToTab('tab-product', { gtin: this.getGtinBatch().gtin });
  }
  create(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const batch = new Batch(evt.detail);
    batch.serialNumbers = batch.serialNumbers.split(',');
    this.sendCreateAction.emit(batch);
  }
  async setRandomBatchNumber() {
    const el = await this.layoutComponent.getInput("batchNumber");
    el.setFocus();
    el.value = generateBatchNumber();
  }
  isCreate() {
    return !this.getGtinBatch() || !this.getGtinBatch().batchNumber;
  }
  getSerials() {
    if (!this.serialsNumbers)
      return;
    return (h("pdm-item-organizer", { "component-name": "generic-chip", "component-props": JSON.stringify(this.serialsNumbers.map(s => ({
        "chip-label": s
      }))), "id-prop": "chip-label", "is-ion-item": false, "display-count": 25, "single-line": "false", onSelectEvent: (evt) => {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        console.log(`Selected ${evt.detail}`);
      } }));
  }
  addSerialNumbers() {
    const newSerials = this.layoutComponent.getInput('serialNumbers').value.split(',');
    this.serialsNumbers = [...this.serialsNumbers, ...newSerials];
  }
  getInputs() {
    const self = this;
    const isCreate = self.isCreate();
    const getRandomBatchNumberButton = function () {
      if (!isCreate)
        return;
      return (h("ion-button", { size: "large", fill: "clear", slot: "end", onClick: () => self.setRandomBatchNumber.call(self) }, h("ion-icon", { slot: "icon-only", name: "shuffle" })));
    };
    const getBarCodeButton = function () {
      if (isCreate)
        return;
      return (h("ion-button", { size: "large", color: "medium", fill: "clear", slot: "end", onClick: (evt) => getBarCodePopOver({
          type: "code128",
          size: "32",
          scale: "6",
          data: self.getGtinBatch().batchNumber
        }, evt) }, h("ion-icon", { slot: "icon-only", name: "barcode" })));
    };
    const formatDate = function (d) {
      return d.getFullYear() + '-' + ("0" + (d.getMonth() + 1)).slice(-2) + '-' + ("0" + d.getDate()).slice(-2);
    };
    const getAddSerialsButton = function () {
      if (self.isCreate())
        return;
      return (h("ion-button", { size: "large", fill: "clear", slot: "end", onClick: () => self.addSerialNumbers() }, h("ion-icon", { slot: "icon-only", name: "add-circle" })));
    };
    return [
      h("ion-item", { class: "ion-margin-top" }, h("ion-label", { position: "floating" }, self.batchNumberString), h("ion-input", { name: "input-batchNumber", required: true, maxlength: 30, disabled: !isCreate, value: isCreate ? '' : (self.batch ? self.batch.batchNumber : '') }), isCreate ? getRandomBatchNumberButton() : getBarCodeButton()),
      h("ion-item", null, h("ion-label", { position: "floating" }, self.expiryString), h("ion-input", { type: "date", name: "input-expiry", min: formatDate(new Date()), required: true, disabled: !isCreate, placeholder: self.expiryPlaceholderString, value: isCreate ? '' : (self.batch ? formatDate(new Date(self.batch.expiry)) : '') })),
      h("ion-item", null, h("ion-label", { position: "floating" }, self.serialsString), h("ion-input", { name: "input-serialNumbers", required: true, pattern: "^[\\d,]+$", placeholder: self.serialsPlaceholderString }), getAddSerialsButton())
    ];
  }
  getCreate() {
    if (!this.isCreate())
      return;
    return this.getInputs();
  }
  getManage() {
    if (this.isCreate())
      return;
    return this.getSerials();
  }
  getPostCreate() {
    if (this.isCreate())
      return;
    return this.getInputs();
  }
  getView() {
  }
  render() {
    if (!this.host.isConnected)
      return;
    return (h(Host, null, h("create-manage-view-layout", { "create-title-string": this.titleString, "manage-title-string": this.manageString, "back-string": this.backString, "create-string": this.addBatchString, "clear-string": this.clearString, "icon-name": "layers", "break-point": "xl-4", "is-create": this.isCreate(), onGoBackEvent: (evt) => this.navigateBack(evt), onCreateEvent: (evt) => this.create(evt) }, h("div", { slot: "create" }, this.getCreate()), h("div", { slot: "postcreate" }, this.getPostCreate()), h("div", { slot: "manage" }, this.getManage()), h("div", { slot: "view" }))));
  }
  get element() { return getElement(this); }
  static get watchers() { return {
    "gtinRef": ["refresh"]
  }; }
};
__decorate([
  HostElement()
], ManagedBatch.prototype, "host", void 0);
ManagedBatch.style = managedBatchCss;

export { ManagedBatch as managed_batch };

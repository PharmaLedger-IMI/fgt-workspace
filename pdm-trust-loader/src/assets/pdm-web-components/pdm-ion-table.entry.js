import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-d0e12a29.js';
import { W as WebManagerService } from './WebManagerService-82558d63.js';
import { H as HostElement } from './index-3dd6e8f7.js';
import { S as SUPPORTED_LOADERS } from './supported-loader-4cd02ac2.js';
import './WizardService-462ec42a.js';

const pdmIonTableCss = ":host{display:block}";

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
const PdmIonTable = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendErrorEvent = createEvent(this, "ssapp-send-error", 7);
    /**
     * Graphical Params
     */
    this.tableTitle = 'PDM Ionic Table';
    this.iconName = undefined;
    this.noContentMessage = "No Content";
    this.loadingMessage = "Loading...";
    this.searchBarPlaceholder = "enter search terms...";
    // @Prop({attribute: 'buttons', mutable: true}) buttons?: string[] | {} = [];
    // @Prop({attribute: 'send-real-events', mutable: true}) sendRealEvents: boolean = false;
    /**
     * Component Setup Params
     */
    /**
     * Shows the search bar or not.
     */
    this.canQuery = true;
    /**
     * Option props to be passed to child elements in from a JSON object in value key format only format
     */
    this.itemProps = undefined;
    /**
     * the querying attribute name so the items can query their own value
     */
    this.autoLoad = false;
    /**
     * Querying/paginating Params - only available when mode is set by ref
     */
    this.query = undefined;
    this.paginated = true;
    this.pageCount = 0;
    this.itemsPerPage = 10;
    this.currentPage = 0;
    this.sort = undefined;
    this.webManager = undefined;
    this.model = undefined;
  }
  sendError(message, err) {
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`ION-TABLE ERROR: ${message}`, err);
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    if (this.autoLoad)
      await this.loadContents();
  }
  updateTable(newModel) {
    if (!this.model) {
      this.model = [...newModel];
      return;
    }
    const model = this.model;
    const equals = [];
    newModel.forEach((m, i) => {
      if (m === model[i])
        equals.push(i);
    });
    this.model = [...newModel];
    this.element.querySelectorAll(`div[id="ion-table-content"] > *`).forEach((e, i) => {
      if (equals.indexOf(i) !== -1)
        if (e.refresh)
          e.refresh();
    });
  }
  async loadContents(pageNumber) {
    this.webManager = this.webManager || await WebManagerService.getWebManager(this.manager);
    if (!this.webManager)
      return;
    if (this.paginated) {
      await this.webManager.getPage(this.itemsPerPage, pageNumber || this.currentPage, this.query, this.sort, false, (err, contents) => {
        if (err) {
          this.sendError(`Could not list items`, err);
          return;
        }
        this.currentPage = contents.currentPage;
        this.pageCount = contents.totalPages;
        this.updateTable(contents.items);
      });
    }
    else {
      await this.webManager.getAll(false, undefined, (err, contents) => {
        if (err) {
          this.sendError(`Could not list items`, err);
          return;
        }
        this.updateTable(contents);
      });
    }
  }
  async _updateByQuery(newQuery, oldQuery) {
    if (!this.host || !this.host.isConnected) // For WebCardinal Compatibility, otherwise it would trigger when they changed the value initially
      return;
    if (!newQuery && !oldQuery)
      return;
    if (newQuery === oldQuery)
      return;
    this.model = undefined;
    await this.refresh();
  }
  async refresh() {
    await this.loadContents();
  }
  async changePage(offset) {
    if (this.currentPage + offset > 0 || this.currentPage + offset <= this.pageCount) {
      this.model = undefined;
      await this.loadContents(this.currentPage + offset);
    }
  }
  getEmptyContent() {
    // @ts-ignore
    return (h("ion-grid", null, h("ion-row", { class: "ion-justify-content-center" }, h("ion-col", { size: "4", class: "ion-justify-content-center" }, h("ion-button", { slot: "start", fill: "clear", onClick: () => this.refresh() }, h("ion-icon", { slot: "icon-only", name: "refresh" })), h("ion-label", { class: "text-align-center" }, this.noContentMessage)))));
  }
  getLoadingContent() {
    return (h("ion-grid", null, h("ion-row", { class: "ion-justify-content-center" }, h("ion-col", { size: "5", class: "ion-justify-content-center" }, h("multi-spinner", { type: SUPPORTED_LOADERS.circles })))));
  }
  getItem(reference) {
    const Tag = this.itemType;
    let props = {};
    props[this.itemReference] = reference;
    if (!!this.itemProps) {
      this.itemProps.split(';').forEach(ip => {
        const keyValue = ip.split(':');
        props[keyValue[0]] = keyValue[1];
      });
    }
    return (h(Tag, Object.assign({}, props)));
  }
  getContent() {
    if (!this.model)
      return this.getLoadingContent();
    const content = [];
    if (!this.model.length)
      return this.getEmptyContent();
    this.model.forEach(reference => {
      content.push(this.getItem(reference));
    });
    return content;
  }
  getTableHeader() {
    const self = this;
    const getSearch = function () {
      if (!self.canQuery)
        return;
      return (h("div", { class: "ion-margin-end" }, h("ion-searchbar", { debounce: 1000, placeholder: self.searchBarPlaceholder, "search-icon": "search-outline" })));
    };
    return (h("div", { class: "ion-margin-top ion-padding-horizontal" }, h("ion-row", { class: "ion-align-items-center ion-justify-content-between" }, h("div", { class: "flex ion-align-items-center" }, h("ion-icon", { size: "large", color: "secondary", name: self.iconName }), h("ion-label", { class: "ion-text-uppercase ion-padding-start", color: "secondary" }, self.tableTitle)), h("ion-row", { class: "ion-align-items-center" }, getSearch(), h("ion-buttons", null, h("slot", { name: "buttons" }))))));
  }
  getPagination() {
    if (!this.paginated)
      return;
    return (h("ion-row", { class: "ion-justify-content-center ion-align-items-center" }, h("ion-buttons", null, h("ion-button", { fill: "clear", size: "small", color: "medium", onClick: () => this.changePage(-1), disabled: this.currentPage <= 1 }, h("ion-icon", { slot: "icon-only", name: "chevron-back-circle-outline" })), h("ion-label", { color: "medium" }, this.currentPage, "/", this.pageCount), h("ion-button", { fill: "clear", size: "small", color: "medium", onClick: () => this.changePage(1), disabled: !(this.currentPage < this.pageCount) }, h("ion-icon", { slot: "icon-only", name: "chevron-forward-circle-outline" })))));
  }
  ;
  render() {
    return (h(Host, null, this.getTableHeader(), h("div", { id: "ion-table-content", class: "ion-padding" }, this.getContent()), this.getPagination()));
  }
  get element() { return getElement(this); }
  static get watchers() { return {
    "query": ["_updateByQuery"]
  }; }
};
__decorate([
  HostElement()
], PdmIonTable.prototype, "host", void 0);
PdmIonTable.style = pdmIonTableCss;

export { PdmIonTable as pdm_ion_table };

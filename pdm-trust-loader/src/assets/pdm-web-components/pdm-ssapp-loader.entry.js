import { r as registerInstance, h, f as Host, g as getElement } from './index-d0e12a29.js';
import { H as HostElement } from './index-3dd6e8f7.js';
import { S as SUPPORTED_LOADERS } from './supported-loader-4cd02ac2.js';

const pdmSsappLoaderCss = ":host{display:block}ion-grid.status-grid{position:fixed;top:55%}#custom-overlay{position:fixed;top:0;right:0;bottom:0;left:0;z-index:100000;width:100%;background-color:var(--ion-color-primary)}.flb{background-color:var(--ion-background-color);height:100%;width:100%;animation:pulse 1s linear forwards;display:flex;align-items:center;justify-content:center}.Aligner-item{max-width:50%}.Aligner-item--top{align-self:flex-start}.Aligner-item--bottom{align-self:flex-end}#custom-overlay div.spinner{display:block}#custom-overlay span.loader{display:block}";

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
const PdmSsappLoader = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.timeout = 1000;
    this.loader = SUPPORTED_LOADERS.simple;
    this.isLoading = true;
    this.progress = undefined;
    this.status = undefined;
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }
  async markAsLoaded() {
    setTimeout(() => {
      this.isLoading = false;
    }, this.timeout);
  }
  async updateStatus(evt) {
    this.status = evt.detail.status;
    this.progress = evt.detail.progress;
  }
  getStatus() {
    if (!(this.status && this.status.length > 0))
      return;
    return (h("ion-col", { size: "12" }, h("ion-item", { lines: "none" }, h("ion-label", { color: "primary", class: "ion-text-center" }, this.status))));
  }
  getProgress() {
    if (!(this.progress && this.progress > 0))
      return;
    return (h("ion-col", { size: "12" }, h("ion-item", { lines: "none" }, h("ion-label", { color: "secondary", class: "ion-text-center" }, this.progress, "%"))));
  }
  getLabels() {
    if (!(this.status || this.progress))
      return;
    return (h("ion-grid", { class: "status-grid" }, h("ion-row", { class: "justify-content-around" }, this.getStatus(), this.getProgress())));
  }
  getLoader() {
    return (h("multi-spinner", { type: this.loader }));
  }
  render() {
    if (!this.isLoading)
      return;
    return (h(Host, null, h("div", { id: "custom-overlay" }, h("div", { class: "flb" }, h("div", { class: "Aligner-item Aligner-item--top" }), this.getLoader(), h("div", { class: "Aligner-item Aligner-item--bottom" }), this.getLabels()))));
  }
  get element() { return getElement(this); }
};
__decorate([
  HostElement()
], PdmSsappLoader.prototype, "host", void 0);
PdmSsappLoader.style = pdmSsappLoaderCss;

export { PdmSsappLoader as pdm_ssapp_loader };

import { r as registerInstance, h, f as Host, g as getElement } from './index-21b82b33.js';
import { H as HostElement } from './index-993dbba1.js';

const pdmBarcodeScannerControllerCss = ":host{display:block;--ion-background-color:var(--ion-background-color)}ion-modal.barcode-scanner{--background:var(--ion-background-color);--border-radius:5px}";

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
const CONTENT_COMPONENT_NAME = 'barcode-reader-modal-content';
const SCANNER_MODE = {
  WEB: 'web',
  CAPACITOR: 'capacitor'
};
const PdmBarcodeScannerController = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.barcodeTitle = "Barcode Reader";
    this.scannerMode = SCANNER_MODE.WEB;
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }
  async processResult(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    await this.dismiss({
      result: evt.detail
    });
  }
  async changeCamera() {
    if (!this.scanner)
      return;
    this.scanner.querySelector('pdm-barcode-scanner').switchCamera();
  }
  async presentWeb(props, callback) {
    await this.defineModalContent();
    if (!callback && typeof props === 'function') {
      callback = props;
      props = undefined;
    }
    const scanner = document.createElement('ion-modal');
    scanner.id = `bar-code-scanner`;
    scanner.component = CONTENT_COMPONENT_NAME;
    scanner.cssClass = 'barcode-scanner';
    scanner.animated = true;
    scanner.showBackdrop = true;
    scanner.backdropDismiss = true;
    scanner.swipeToClose = true;
    scanner.componentProps = props;
    this.scanner = scanner;
    this.element.appendChild(this.scanner);
    await this.scanner.present();
    if (callback)
      return this.holdForScan(callback);
    return this;
  }
  async presentCapacitor(callback) {
    callback(`Mode not supported (yet)`);
  }
  async present(props, callback) {
    if (!callback && typeof props === 'function') {
      callback = props;
      props = undefined;
    }
    switch (this.scannerMode) {
      case SCANNER_MODE.CAPACITOR:
        return this.presentCapacitor(callback);
      default:
        return this.presentWeb(props, callback);
    }
  }
  async holdForScan(callback) {
    if (this.scannerMode !== SCANNER_MODE.WEB)
      return callback(`this method ins not supported in this mode. please change to ${SCANNER_MODE.WEB}`);
    const { data } = await this.scanner.onWillDismiss();
    this.scanner = undefined;
    callback(undefined, data);
  }
  async dismiss(result) {
    if (this.scanner)
      switch (this.scannerMode) {
        case SCANNER_MODE.CAPACITOR:
          console.log('NOT SUPPORTED YET');
          break;
        default:
          await this.scanner.dismiss(result);
      }
    this.scanner = undefined;
  }
  async defineModalContent() {
    const self = this;
    if (self.scannerMode !== SCANNER_MODE.WEB)
      return;
    if (!!customElements.get(CONTENT_COMPONENT_NAME))
      return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevicesCount = devices.filter(device => device.kind === 'videoinput').length;
    customElements.define(CONTENT_COMPONENT_NAME, class extends HTMLElement {
      connectedCallback() {
        const modalElement = document.querySelector('ion-modal.barcode-scanner');
        const title = modalElement.componentProps && modalElement.componentProps.title ? modalElement.componentProps.title : self.barcodeTitle;
        this.innerHTML = `
<ion-header>
  <ion-toolbar>
    <ion-icon slot="start" class="ion-padding-horizontal" name="qr-code"></ion-icon>
    <ion-title>${title}</ion-title>
    <ion-buttons slot="end">
    ${videoDevicesCount > 1 ?
          h("ion-button", { id: "change-camera" }, h("ion-icon", { slot: "icon-only", name: "sync-outline" }))
          : ''}
      <ion-button id="dismiss-modal">
        <ion-icon slot="icon-only" name="close-outline"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
<ion-content class="ion-padding">
  <pdm-barcode-scanner></pdm-barcode-scanner>
</ion-content>`;
        const changeCameraButton = this.querySelector('#change-camera');
        if (changeCameraButton)
          changeCameraButton.addEventListener('click', () => {
            self.changeCamera();
          });
        const dismissButton = this.querySelector('#dismiss-modal');
        dismissButton.addEventListener('click', () => {
          self.dismiss();
        });
      }
    });
  }
  render() {
    return (h(Host, null, h("div", { id: "barcode-scanner-controller" })));
  }
  get element() { return getElement(this); }
};
__decorate([
  HostElement()
], PdmBarcodeScannerController.prototype, "host", void 0);
PdmBarcodeScannerController.style = pdmBarcodeScannerControllerCss;

export { PdmBarcodeScannerController as pdm_barcode_scanner_controller };

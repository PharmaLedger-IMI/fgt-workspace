import {Component, Host, h, Element, Prop, Method, Listen} from '@stencil/core';
import {HostElement} from "../../decorators";

const CONTENT_COMPONENT_NAME = 'barcode-reader-modal-content';

const SCANNER_MODE = {
  WEB: 'web',
  CAPACITOR: 'capacitor'
}

@Component({
  tag: 'pdm-barcode-scanner-controller',
  styleUrl: 'pdm-barcode-scanner-controller.css',
  shadow: false,
})
export class PdmBarcodeScannerController {

  @HostElement() host;

  @Element() element;

  @Prop({attribute: "barcode-title"}) barcodeTitle?: string = "Barcode Reader";

  @Prop({attribute: "scanner-mode"}) scannerMode?: string = SCANNER_MODE.WEB;

  private scanner;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }

  @Listen('ssapp-action')
  async processResult(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    await this.dismiss({
      result: evt.detail
    });
  }

  @Method()
  async changeCamera(){
    if (!this.scanner)
      return;
    this.scanner.querySelector('pdm-barcode-scanner').switchCamera();
  }

  private async presentWeb(props?, callback?){
    await this.defineModalContent();
    if (!callback && typeof props === 'function'){
      callback = props;
      props= undefined;
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

  private async presentCapacitor(callback?){
    callback(`Mode not supported (yet)`);
  }

  @Method()
  async present(props?, callback?){
    if (!callback && typeof props === 'function'){
      callback = props;
      props= undefined;
    }
    switch (this.scannerMode){
      case SCANNER_MODE.CAPACITOR:
        return this.presentCapacitor(callback);
      default:
        return this.presentWeb(props, callback);
    }
  }

  @Method()
  async holdForScan(callback){
    if (this.scannerMode !== SCANNER_MODE.WEB)
      return callback(`this method ins not supported in this mode. please change to ${SCANNER_MODE.WEB}`);
    const {data} = await this.scanner.onWillDismiss();
    this.scanner = undefined;
    callback(undefined, data);
  }

  @Method()
  async dismiss(result?){
    if (this.scanner)
      switch(this.scannerMode){
        case SCANNER_MODE.CAPACITOR:
          console.log('NOT SUPPORTED YET');
          break;
        default:
          await this.scanner.dismiss(result);
      }
    this.scanner = undefined;
  }

  private async defineModalContent(){
    const self = this;

    if (self.scannerMode !== SCANNER_MODE.WEB)
      return;

    if (!!customElements.get(CONTENT_COMPONENT_NAME))
      return;

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevicesCount = devices.filter(device => device.kind === 'videoinput').length;

    customElements.define(CONTENT_COMPONENT_NAME, class extends HTMLElement{
      connectedCallback(){

        const modalElement: any = document.querySelector('ion-modal.barcode-scanner');
        const title = modalElement.componentProps.title || self.barcodeTitle;
        this.innerHTML = `
<ion-header>
  <ion-toolbar>
    <ion-icon slot="start" class="ion-padding-horizontal" name="qr-code-outline"></ion-icon>
    <ion-title>${title}</ion-title>
    <ion-buttons slot="end">
    ${videoDevicesCount > 1 ?
          <ion-button id="change-camera">
            <ion-icon slot="icon-only" name="sync-outline"></ion-icon>
          </ion-button>
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
    return (
      <Host>
        <div id="barcode-scanner-controller"></div>
      </Host>
    );
  }
}

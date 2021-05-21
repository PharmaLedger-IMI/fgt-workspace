import {Component, Host, h, Element, Prop, Method, Listen} from '@stencil/core';
import {HostElement} from "../../decorators";

const CONTENT_COMPONENT_NAME = 'barcode-reader-modal-content';

@Component({
  tag: 'pdm-barcode-scanner-controller',
  styleUrl: 'pdm-barcode-scanner-controller.css',
  shadow: false,
})
export class PdmBarcodeScannerController {

  @HostElement() host;

  @Element() element;

  @Prop({attribute: "barcode-title"}) barcodeTitle?: string = "Barcode Reader";

  private scanner;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.defineModalContent();
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

  @Method()
  async present(props?){
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
  }

  @Method()
  async holdForScan(callback){
    if (!this.scanner)
      return callback(`No scanner presented`);
    const {data} = await this.scanner.onWillDismiss();
    callback(undefined, data);
  }

  @Method()
  async dismiss(result?){
    if (this.scanner)
      await this.scanner.dismiss(result);
  }

  private defineModalContent(){
    const self = this;

    if (!!customElements.get(CONTENT_COMPONENT_NAME))
      return;
    customElements.define(CONTENT_COMPONENT_NAME, class extends HTMLElement{
      connectedCallback(){
        this.innerHTML = `
<ion-header>
  <ion-toolbar>
    <ion-icon slot="start" class="ion-padding-horizontal" name="qr-code-outline"></ion-icon>
    <ion-title>${self.barcodeTitle}</ion-title>
    <ion-buttons slot="end">
      <ion-button id="change-camera">
        <ion-icon slot="icon-only" name="sync-outline"></ion-icon>
      </ion-button>
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
        <div></div>
      </Host>
    );
  }
}

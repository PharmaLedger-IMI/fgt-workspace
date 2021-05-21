import {Component, Prop, State, Element, h, Event, EventEmitter, Method} from '@stencil/core';
import { VideoOverlay } from './overlays';
import audio from './audio';
import {BrowserMultiFormatReader, NotFoundException} from "@zxing/library";
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";

const INTERVAL_ZXING_LOADED = 300;
const INTERVAL_BETWEEN_SCANS = 2000;
const DELAY_AFTER_RESULT = 500;
const STATUS = {
  IN_PROGRESS: "Camera detection in progress...",
  DONE: "Scan done.",
  NO_DETECTION: "No camera detected."
}

customElements.define('barcode-reader', class extends HTMLElement{
  connectedCallback(){
    this.innerHTML = `
<!-- Ionic dist -->
<ion-header>
  <ion-toolbar>
    <ion-title>Barcode Reader</ion-title>
    <ion-buttons slot="primary">
        <ion-button onClick="dismissModal()">
        <ion-icon slot="icon-only" name="close"></ion-icon>
      </ion-button>
      <ion-button onClick="dismissModal()">
        <ion-icon slot="icon-only" name="close"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
<ion-content class="ion-padding">
  <pdm-barcode-scanner></pdm-barcode-scanner>
</ion-content>`;
  }
});

@Component({
  tag: 'pdm-barcode-scanner',
  styleUrl: 'pdm-barcode-scanner.css',
  shadow: false,
})
export class PdmBarcodeScanner {

  @Element() element;

  /**
   * Through this event errors are passed
   */
  @Event({
    eventName: 'ssapp-send-error',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendErrorEvent: EventEmitter;

  /**
   * Through this event data is passed
   */
  @Event({
    eventName: 'ssapp-action',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendActionEvent: EventEmitter;

  @Prop({attribute: 'data', mutable: true}) data: any;

  @Prop({attribute: 'loader-type'}) loaderType?: string = SUPPORTED_LOADERS.bubbling;

  @State() activeDeviceId: string | null = null;
  @State() status = STATUS.IN_PROGRESS;
  @State() isCameraAvailable = false;

  private codeReader = null;
  private overlay = null;
  private devices = [];
  private isScanDone = false;
  private isComponentDisconnected = false;

  constructor() {
    window.addEventListener('resize', _ => {
      this.cleanupOverlays();
      this.drawOverlays();
    });
  }

  private drawOverlays() {
    if (!this.element) {
      return;
    }

    const videoElement = this.element.querySelector('#video');
    const scannerContainer = this.element.querySelector('#scanner-container');

    this.overlay = new VideoOverlay(scannerContainer, videoElement);
    this.overlay.createOverlaysCanvases('lensCanvas', 'overlayCanvas');
    this.overlay.drawLensCanvas();
  }

  private cleanupOverlays() {
    if (this.overlay) {
      this.overlay.removeOverlays();
    }
  }

  private publishResult(result){
    this.data = result;
    this.sendActionEvent.emit(result);
  }

  private startScanning(deviceId) {
    const videoElement = this.element.querySelector('#video');

    const constraints = {
      video: {
        facingMode: 'environment'
      }
    };

    if (deviceId && deviceId !== 'no-camera') {
      delete constraints.video.facingMode;
      constraints.video['deviceId'] = {
        exact: deviceId
      };
    }

    if (!this.isScanDone) {
      this.cleanupOverlays();
      this.drawOverlays();

      this.codeReader.reset();
      this.codeReader.decodeFromConstraints(constraints, videoElement, (result, err) => {
        if (result && !this.isScanDone) {
          console.log('result', result);

          audio.play();
          this.overlay.drawOverlay(result.resultPoints);
          this.publishResult(result.text);
          this.isScanDone = true;
          this.status = STATUS.DONE;

          setTimeout(_ => {
            this.codeReader.reset();
            this.overlay.removeOverlays();
          }, DELAY_AFTER_RESULT);

        }
        if (err && !(err instanceof NotFoundException)) {
          console.error(err);
        }
      });
    }
  }

  @Method()
  async switchCamera() {
    let devices = [undefined];

    for (const device of this.devices) {
      devices.push(device.deviceId);
    }

    let currentIndex = devices.indexOf(this.activeDeviceId);
    if (currentIndex === devices.length - 1) {
      currentIndex = -1;
    }
    currentIndex++;

    this.activeDeviceId = devices[currentIndex];
    this.isScanDone = false;
  }

  async componentWillLoad() {
    let tick = () => {
      if (!this.codeReader) {
        this.codeReader = new BrowserMultiFormatReader(null, INTERVAL_BETWEEN_SCANS);
      } else {
        setTimeout(tick, INTERVAL_ZXING_LOADED);
      }
    };

    tick();
  }

  async componentWillRender() {

    // No devices yet
    if (this.devices.length === 0 || !this.activeDeviceId) {
      try {
        this.devices = await this.codeReader.listVideoInputDevices();
      } catch (error) {
        // console.error(error);
      }

      if (this.devices.length > 0) {
        this.isCameraAvailable = true;
      } else {
        this.status = STATUS.NO_DETECTION;
      }
    }
  }

  async componentDidRender() {
    if (this.isCameraAvailable && !this.isComponentDisconnected) {
      this.startScanning(this.activeDeviceId);
    }
  }

  async connectedCallback() {
    this.isComponentDisconnected = false;
  }

  async disconnectedCallback() {
    this.isComponentDisconnected = true;

    if (this.codeReader) {
      this.codeReader.reset();
    }
  }

  render() {

    const self = this;

    const getContent = function(){
      if (!self.isCameraAvailable)
        return [<multi-loader type={self.loaderType}></multi-loader>];
      if (!self.isScanDone)
        return [
          <input type="file" accept="video/*" capture="camera"/>,
          <video id="video" muted autoplay playsinline={true}/>
        ];
      return [<div>{self.status}</div>]
    }

    return (
      <div class="barcodeWrapper">
        <div id="scanner-container" class="videoWrapper">
          {...getContent()}
        </div>
      </div>
    )
    //
    // return (
    //   <div class="barcodeWrapper">
    //     {
    //       this.isCameraAvailable && !this.isScanDone
    //         ? (
    //           <div id="scanner-container" class="videoWrapper">
    //             <input type="file" accept="video/*" capture="camera"/>
    //             <video id="video" muted autoplay playsinline={true}/>
    //           </div>
    //         )
    //         : <div>{this.status}</div>
    //     }
    //   </div>
    // );
  }
}

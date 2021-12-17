import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebManager, WebManagerService} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
import {getBarCodePopOver} from "../../utils/popOverUtils";

const {Batch, IndividualProduct, utils} = wizard.Model;

@Component({
  tag: 'managed-individual-product-list-item',
  styleUrl: 'managed-individual-product-list-item.css',
  shadow: false,
})
export class ManagedBatchListItem {

  @HostElement() host: HTMLElement;

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
   * Through this event action requests are made
   */
  @Event({
    eventName: 'ssapp-action',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendActionEvent: EventEmitter;
  /**
   * Through this event tracking requests are made
   */
  @Event({
    eventName: 'fgt-track-request',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendTrackingRequestEvent: EventEmitter;

  private triggerTrack(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.sendTrackingRequestEvent.emit(new IndividualProduct({
      gtin: this.individualProduct.gtin,
      batchNumber: this.individualProduct.batchNumber,
      serialNumber: this.individualProduct.serialNumber
    }));
  }

  private sendError(message: string, err?: object){
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Product Component: ${message}`, err);
  }

  private sendAction(evt, action){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const event = this.sendActionEvent.emit({
      action: action,
      individualProduct: new IndividualProduct(this.individualProduct)
    });
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored byt all components...`);
  }

  @Prop({attribute: 'gtin-batch-serial'}) gtinBatchSerial: string;

  @Prop({attribute: 'show-close-button'}) showCloseButton: boolean = true

  @Prop({attribute: 'show-track-button'}) showTrackButton: boolean = true

  @Prop() isHeader: boolean;

  private batchManager: WebManager = undefined;
  private productManager: WebManager = undefined;

  @State() individualProduct: typeof IndividualProduct = undefined;
  @State() status: string = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    if (!this.gtinBatchSerial)
      return;

    this.batchManager = await WebManagerService.getWebManager("BatchManager");
    this.productManager = await WebManagerService.getWebManager("ProductManager");
    await this.refresh();
  }

  async loadProduct(){
    let self = this;
    if (!self.batchManager || !self.productManager || !self.individualProduct)
      return;
    const gtinBatch = `${self.individualProduct.gtin}-${self.individualProduct.batchNumber}`;

    if(!this.isHeader)
      self.productManager.getOne(self.individualProduct.gtin, true, (err, product) => {
        if (err)
          return self.sendError(`Could not get Product with gtin ${self.individualProduct.gtin}`, err);
        self.batchManager.getOne(gtinBatch, true, (err, batch: typeof Batch) => {
          if (err)
            return self.sendError(`Could not get Batch with code ${gtinBatch}`, err);

          self.individualProduct = new IndividualProduct(Object.assign(self.individualProduct, {
            name: product.name,
            expiry: batch.expiry,
            status: batch.batchStatus
          }));
        });
      });
  }

  @Watch('gtinBatchSerial')
  @Method()
  async refresh(newValue?){
    if(newValue && newValue.startsWith('@'))
      return;
    if (!newValue && (!this.gtinBatchSerial || this.gtinBatchSerial.startsWith('@')))
      return;

    const props = this.gtinBatchSerial.split('-');

    this.individualProduct = new IndividualProduct({
      gtin: props[0],
      batchNumber: props[1],
      serialNumber: props[2]
    });

    await this.loadProduct();
  }

  addLabel(){
    const self = this;
    if (!self.individualProduct)
      return (<multi-spinner slot="content" type={SUPPORTED_LOADERS.bubblingSmall}></multi-spinner>)

    const getNameLabel = function(){
      if(self.isHeader)
        return 'Name';
      return self.individualProduct.name;
    }

    const getGtinLabel = function(){
      if(self.isHeader)
        return 'Gtin';
      return self.individualProduct.gtin;
    }

    const getBatchNumberLabel = function(){
      if(self.isHeader)
        return 'Batch Number';
      return self.individualProduct.batchNumber;
    }


    if(this.isHeader)
      return(
        <ion-label slot="label" color="secondary">
          <ion-row>
            <ion-col col-12 col-sm align-self-end size-lg={2}>
              <span class="ion-padding-start">
              {getGtinLabel()}
              </span>       
            </ion-col>
            <ion-col col-12 col-sm align-self-end size-lg={1}>
              <span class="ion-padding-start">
                {getNameLabel()}
              </span>    
            </ion-col>
            <ion-col col-12 col-sm align-self-end size-lg={3}>
              <span class="ion-padding-start">
                {getBatchNumberLabel()}
              </span>    
            </ion-col>
          </ion-row>
      </ion-label>
      )

    return(
      <ion-label slot="label" color="secondary">
        {getGtinLabel()}
        <span class="ion-padding-start">{getNameLabel()}</span>
        <span class="ion-padding-start">{getBatchNumberLabel()}</span>
        {/*<span class="ion-padding-start">{getExpiryLabel()}</span>*/}
      </ion-label>)
  }

  addBatch(){
    if (!this.individualProduct || !this.individualProduct.status)
      return (<multi-spinner slot="content" type={SUPPORTED_LOADERS.bubblingSmall}></multi-spinner>);
    return (
      <ion-badge>{this.individualProduct.status.status}</ion-badge>
    )
  }

  addSerialsNumber(){
    const self = this;
    if(self.isHeader){
      return (
        <ion-label slot="content" color="secondary">
          <ion-row>
            <ion-col col-12 col-sm align-self-end size-lg={6}>
                <span class="ion-padding-end">
                  {"Serial Numbers"}
                </span>       
            </ion-col>
          </ion-row>
        </ion-label>
      )
    }
    if (!this.individualProduct || !this.individualProduct.serialNumber)
      return (<multi-spinner slot="content" type={SUPPORTED_LOADERS.bubblingSmall}></multi-spinner>);
    return (
      <generic-chip slot="content" chip-label={this.individualProduct.serialNumber}></generic-chip>
    )
  }

  addButtons(){
    let self = this;

    if(self.isHeader){
      return (
          <div slot = "buttons">
            <ion-label color="secondary">
              {"Actions"}
            </ion-label>
          </div>
      )
    }

    if (!self.individualProduct)
      return;
    const getButton = function(slot, color, icon, handler){
      return (
        <ion-button slot={slot} color={color} fill="clear" onClick={handler}>
          <ion-icon size="large" slot="icon-only" name={icon}></ion-icon>
        </ion-button>
      )
    }

    const {gtin, batchNumber, expiry, serialNumber} = self.individualProduct;
    const result = [
      getButton("buttons", "medium", "barcode", (evt) => getBarCodePopOver({
        type: "gs1datamatrix",
        size: "32",
        scale: "6",
        data: utils.generate2DMatrixCode(gtin, batchNumber, expiry.valueOf(), serialNumber)
      }, evt))
    ];
    if (self.showTrackButton)
      result.push(getButton("buttons", "secondary", "share-social", self.triggerTrack.bind(self)));
    if (self.showCloseButton)
      result.push(getButton("buttons", "danger", "close-circle", (evt) => self.sendAction(evt, 'remove')))
    return result;
  }

  render() {
    return (
      <Host>
        <list-item-layout label-col="7">
          {this.addLabel()}
          {this.addSerialsNumber()}
          {...this.addButtons()}
        </list-item-layout>
      </Host>
    );
  }
}

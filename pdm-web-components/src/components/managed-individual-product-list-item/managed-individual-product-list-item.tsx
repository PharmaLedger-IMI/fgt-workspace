import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebManager, WebManagerService} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {getBarCodePopOver} from "../../utils/popOverUtils";

const {Batch, IndividualProduct, utils} = wizard.Model;

@Component({
  tag: 'managed-individual-product-list-item',
  styleUrl: 'managed-individual-product-list-item.css',
  shadow: false,
})
export class ManagedIndividualProductListItem {

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

    if(!self.isHeader)
      self.productManager.getOne(self.individualProduct.gtin, true, (err, product) => {
        if (err)
          return self.sendError(`Could not get Product with gtin ${self.individualProduct.gtin}`, err);
        self.batchManager.getOne(gtinBatch, true, (err, batch: typeof Batch) => {
          if (err)
            return self.sendError(`Could not get Batch with code ${gtinBatch}`, err);

          self.individualProduct = new IndividualProduct(Object.assign(self.individualProduct, {
            name: product.name,
            expiry: batch.expiry,
            status: batch.batchStatus.status
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

  addSerialsNumber(){
    const self = this;
  
    if(self.isHeader){
      return (
        <ion-col slot="content" color="secondary" size= "auto">
          <ion-label color="secondary">
            {"Serial Nº"}
          </ion-label>       
        </ion-col>
      )
    }

    if (!this.individualProduct || !this.individualProduct.serialNumber)
      return (<ion-skeleton-text animated></ion-skeleton-text>);

    return (
      <generic-chip slot="content" chip-label={this.individualProduct.serialNumber}></generic-chip>
    )
  }

  addButtons(){
    const self = this;

    const getButton = function(slot, color, icon, handler){
      return (
        <ion-button slot={slot} color={color} fill="clear" onClick={handler}>
          <ion-icon size="large" slot="icon-only" name={icon}></ion-icon>
        </ion-button>
      )
    }

    const getMockButton = function(){
      return (
        <ion-button slot="buttons" color="secondary" fill="clear" disabled="true">
          <ion-icon size="large" slot="icon-only" name="some-name"></ion-icon>
          {/* <ion-icon size="large" slot="icon-only" name="information-circle-sharp"></ion-icon> */}
        </ion-button>
      )
    }

    const getTrackButton = function(){
      if(!self.showTrackButton)
        return;
      
      if(self.isHeader)
        return getMockButton();

      if(!self.individualProduct)
        return;
      
      return getButton("buttons", "medium", "share-social", self.triggerTrack.bind(self));
    }

    const getCloseButton = function(){
      if (!self.showCloseButton)
        return;

      if(self.isHeader)
        return getMockButton();

      if(!self.individualProduct)
        return;
      
      return getButton("buttons", "danger", "close-circle", (evt) => self.sendAction(evt, 'remove'));
    }

    if(self.isHeader)
      return[
        getMockButton(),
        getTrackButton(),
        getCloseButton()
      ]

    if (!self.individualProduct)
      return (<ion-skeleton-text animated></ion-skeleton-text>);    

    const {gtin, batchNumber, expiry, serialNumber} = self.individualProduct;

    return [
      getButton("buttons", "medium", "barcode", (evt) => getBarCodePopOver({
        type: "gs1datamatrix",
        size: "32",
        scale: "6",
        data: utils.generate2DMatrixCode(gtin, batchNumber, expiry.valueOf(), serialNumber)
      }, evt)),
      getTrackButton(),
      getCloseButton()
    ]
  }

  addGtinLabel(){
    const self = this;

    const getGtinLabel = function(){
      if(self.isHeader)
        return "Gtin";

      if(!self.individualProduct || !self.individualProduct.gtin)
        return (<ion-skeleton-text animated></ion-skeleton-text>);

      return self.individualProduct.gtin;
    }

    return(
      <ion-label slot="label0" color="secondary">
          {getGtinLabel()}
      </ion-label>
    )
  }

  addNameLabel(){
    const self = this;

    const getNameLabel = function(){
      if(self.isHeader)
        return "Product Name"

      if(!self.individualProduct || !self.individualProduct.name)
        return (<ion-skeleton-text animated></ion-skeleton-text>);

      return self.individualProduct.name;
    }

    return(
      <ion-label slot="label1" color="secondary">
        {getNameLabel()}
      </ion-label>
    )

  }

  addBatchNumberLabel(){
    const self = this;

    const getBatchNumberLabel = function(){
      if(self.isHeader)
        return "Batch Nº"; 

      if (!self.individualProduct || !self.individualProduct.batchNumber)
        return (<ion-skeleton-text animated></ion-skeleton-text>)

      return self.individualProduct.batchNumber;
    }

    return(
      <ion-label slot="label2" color="secondary">
        {getBatchNumberLabel()}
      </ion-label>
    )
  }

  addStatusLabel(){
    const self = this;

    const getStatusBadge = function(){
      if(self.isHeader)
        return "Status";

      if(!self.individualProduct || !self.individualProduct.status)
        return (<ion-skeleton-text animated></ion-skeleton-text>)

      return (
        <status-badge slot="badges" status={self.individualProduct.status}></status-badge>
      )
    }

    return(
      <ion-label slot="label3" color="secondary">
        {getStatusBadge()}
      </ion-label>
    )
  } 

  generateLabelLayoutConfig(){
    const obj = {
      0 : {
        sizeByScreen: {
          "xs": 4,
          "sm": 4,
          "md": 3,
          "lg": 3,
          "xl":2
        },
        center: false,
      },
      1 : {
        sizeByScreen: {
          "xs": 4,
          "sm": 4,
          "md": 3,
          "lg": 3,
          "xl":2
        },
        center: false,
      },
      2 : {
        sizeByScreen: {
          "xs": 2,
          "sm": 2,
          "md": 2,
          "lg": 2,
          "xl":1
        },
        center: false,
      },
      // 3 : {
      //   sizeByScreen: {
      //     "xs": 3,
      //     "sm": 3,
      //     "md": 3,
      //     "lg": 3, //maybe2
      //     "xl":2
      //   },
      //   center: true,
      // }     
    }

    return JSON.stringify(obj);
  }

  render() {
    return (
      <Host>
        
        <list-item-layout-default buttons={true}  label-col-config={this.generateLabelLayoutConfig()}>
          {this.addGtinLabel()}
          {this.addNameLabel()}
          {this.addBatchNumberLabel()}
          {/* {this.addStatusLabel()} */}
          {this.addSerialsNumber()}
          {this.addButtons()}
        </list-item-layout-default>
      </Host>
    );
  }
}
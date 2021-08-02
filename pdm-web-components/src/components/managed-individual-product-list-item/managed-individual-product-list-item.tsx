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

    self.productManager.getOne(self.individualProduct.gtin, true, (err, product) => {
      if (err)
        return self.sendError(`Could not get Product with gtin ${self.individualProduct.gtin}`, err);
      self.batchManager.getOne(gtinBatch, true, (err, batch: typeof Batch) => {
        if (err)
          return self.sendError(`Could not get Batch with code ${gtinBatch}`, err);

        self.individualProduct = new IndividualProduct(Object.assign(self.individualProduct, {
          name: product.name,
          expiry: batch.expiry,
          status: batch.status
        }));
      });
    });
  }

  @Watch('gtinBatchSerial')
  @Method()
  async refresh(newValue?){
    if(newValue && newValue.startsWith('@'))
      return;
    if (!newValue)
      return;

    const props = this.gtinBatchSerial.split('-');

    this.individualProduct = new IndividualProduct({
      gtin: props[0],
      batchNumber: props[1],
      serialNumber: props[1]
    });

    await this.loadProduct();
  }

  addLabel(){
    const self = this;

    const getBatchNumberLabel = function(){
      return self.individualProduct.batchNumber;
    }

    const getExpiryLabel = function(){
      if (!self.individualProduct || !self.individualProduct.expiry)
        return (<multi-spinner slot="content" type={SUPPORTED_LOADERS.bubblingSmall}></multi-spinner>)
      return self.individualProduct.expiry;
    }

    return(
      <ion-label slot="label" color="secondary">
        {getBatchNumberLabel()}
        <span class="ion-padding-start">{getExpiryLabel()}</span>
      </ion-label>)
  }

  addSerialsNumbers(){
    if (!this.individualProduct || !this.individualProduct.serialNumber)
      return (<multi-spinner slot="content" type={SUPPORTED_LOADERS.bubblingSmall}></multi-spinner>);
    return (
      <generic-chip chipl-label={this.individualProduct.serialNumber}></generic-chip>
    )
  }

  addButtons(){
    let self = this;

    const getButton = function(slot, color, icon, handler){
      if (!self.individualProduct)
        return;
      return (
        <ion-button slot={slot} color={color} fill="clear" onClick={handler}>
          <ion-icon size="large" slot="icon-only" name={icon}></ion-icon>
        </ion-button>
      )
    }

    const {gtin, batchNumber, expiry, serialNumber} = self.individualProduct;
    return [
      getButton("buttons", "medium", "barcode", (evt) => getBarCodePopOver({
        type: "gs1datamatrix",
        size: "32",
        scale: "6",
        data: utils.generate2DMatrixCode(gtin, batchNumber, expiry, serialNumber)
      }, evt)),
      getButton("buttons", "danger", "close-circle", (evt) => self.sendAction(evt, 'remove'))
    ]
  }

  render() {
    return (
      <Host>
        <list-item-layout>
          {this.addLabel()}
          {this.addSerialsNumbers()}
          {...this.addButtons()}
        </list-item-layout>
      </Host>
    );
  }
}

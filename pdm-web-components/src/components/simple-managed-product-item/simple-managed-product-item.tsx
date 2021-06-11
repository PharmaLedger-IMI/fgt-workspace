import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebManager, WebManagerService} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";

const Product = wizard.Model.Product;

@Component({
  tag: 'simple-managed-product-item',
  styleUrl: 'simple-managed-product-item.css',
  shadow: false,
})
export class SimpleManagedProductItem {

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
   * Through this event navigation requests to tabs are made
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

  private sendAction(message){
    const event = this.sendActionEvent.emit(message);
    if (!event.defaultPrevented)
      console.log(`Product Component: ${message}`);
  }

  @Prop({attribute: 'gtin', mutable: true}) gtin: string;

  private productManager: WebManager = undefined;

  @State() product: typeof Product = undefined;


  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.productManager = await WebManagerService.getWebManager("ProductManager");
    return await this.loadProduct();
  }

  async loadProduct(){
    let self = this;
    if (!self.productManager)
      return;
    self.productManager.getOne(self.gtin, true, (err, product) => {
      if (err)
        return self.sendError(`Could not get Product with gtin ${self.gtin}`, err);
      this.product = product;
    });
  }

  @Watch('gtin')
  @Method()
  async refresh(){
    await this.loadProduct();
  }

  addBarCode(){
    const self = this;

    const getBarCode = function(){
      if (!self.product || !self.product.gtin)
        return (<multi-spinner type={SUPPORTED_LOADERS.bubblingSmall}></multi-spinner>);
      return (<barcode-generator class="ion-align-self-center" type="code128" size="16" scale="3" data={self.product.gtin}></barcode-generator>);
    }

    return(
      <ion-thumbnail class="ion-align-self-center" slot="start">
        {getBarCode()}
      </ion-thumbnail>
    )
  }

  addLabel(){
    const self = this;

    const getGtinLabel = function(){
      if (!self.gtin)
        return (<h4><ion-skeleton-text animated></ion-skeleton-text> </h4>)
      return (<h4>{self.gtin}</h4>)
    }

    const getNameLabel = function(){
      if (!self.product || !self.product.name)
        return (<h5><ion-skeleton-text animated></ion-skeleton-text> </h5>)
      return (<h5>{self.product.name}</h5>)
    }


    return(
      <ion-label class="ion-padding-horizontal ion-align-self-center">
        {getGtinLabel()}
        {getNameLabel()}
      </ion-label>)
  }


  render() {
    return (
      <Host>
        <ion-item lines="none" button={true} onClick={() => this.sendAction(this.gtin)} class="ion-align-self-center simple-item">
          {this.addBarCode()}
          {this.addLabel()}
        </ion-item>
      </Host>
    );
  }
}

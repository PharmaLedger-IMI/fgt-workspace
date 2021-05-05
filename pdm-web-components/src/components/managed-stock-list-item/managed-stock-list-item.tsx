import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebManagerService, WebManager} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {EVENT_SEND_ERROR} from "../../constants/events";
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";

const Stock = wizard.Model.Stock;

@Component({
  tag: 'managed-stock-list-item',
  styleUrl: 'managed-stock-list-item.css',
  shadow: false,
})
export class ManagedProductListItem {

  @HostElement() host: HTMLElement;

  @Element() element;

  /**
   * Through this event errors are passed
   */
  @Event({
    eventName: EVENT_SEND_ERROR,
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendErrorEvent: EventEmitter;

  /**
   * Through this event navigation requests to tabs are made
   */
  @Event({
    eventName: 'ssapp-navigate-tab',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendNavigateTab: EventEmitter;

  private sendError(message: string, err?: object){
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Product Component: ${message}`, err);
  }

  private navigateToTab(tab: string,  props: any){
    const event = this.sendNavigateTab.emit({
      tab: tab,
      props: props
    });
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored byt all components...`);
  }

  @Prop() gtin: string;

  private stockManager: WebManager = undefined;

  @State() stock: typeof Stock = undefined;
  @State() batches: string[] = undefined;
  @State() quantity: number = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.stockManager = await WebManagerService.getWebManager("StockManager");
    return await this.loadStock();
  }

  async loadStock(){
    let self = this;
    if (!self.stockManager)
      return;
    self.stockManager.getOne(self.gtin, true, (err, stock) => {
      if (err){
        self.sendError(`Could not get Product with gtin ${self.gtin}`, err);
        return;
      }
      this.stock = new Stock(stock);
      this.batches = [...stock.batches];
      this.quantity = this.stock.getQuantity();
    });
  }

  @Watch('gtin')
  @Method()
  async refresh(){
    await this.loadStock();
  }

  addBarCode(){
    const self = this;

    const getBarCode = function(){
      if (!self.stock || !self.stock.gtin)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return (<barcode-generator class="ion-align-self-center" type="code128" size="32" scale="6" data={self.stock.gtin}></barcode-generator>);
    }

    return(
      <ion-thumbnail className="ion-align-self-center" slot="start">
        {getBarCode()}
      </ion-thumbnail>
    )
  }

  addLabel(){
    const self = this;

    const getGtinLabel = function(){
      if (!self.stock || !self.stock.gtin)
        return (<h3><ion-skeleton-text animated></ion-skeleton-text> </h3>)
      return (<h3>{self.stock.gtin}</h3>)
    }

    const getNameLabel = function(){
      if (!self.stock || !self.stock.name)
        return (<h5><ion-skeleton-text animated></ion-skeleton-text> </h5>)
      return (<h5>{self.stock.name}</h5>)
    }

    const getQuantityLabel = function(){
      if (!self.stock || !self.stock.description)
        return (<p><ion-skeleton-text animated></ion-skeleton-text> </p>)
      return (<p>{self.stock.quantity}</p>)
    }

    return(
      <ion-label className="ion-padding-horizontal ion-align-self-center">
        {getGtinLabel()}
        {getNameLabel()}
        {getQuantityLabel()}
      </ion-label>)
  }

  addBatch(batch){
    return(
      <batch-chip gtin-batch={this.stock.gtin + '-' + batch.batchNumber} loader-type={SUPPORTED_LOADERS.bubblingSmall} mode="detail" quantity={this.quantity}></batch-chip>
    )
  }

  addBatches(){
    const batches = !!this.stock && !!this.batches ? this.batches.map(b => this.addBatch(b)) : (<ion-skeleton-text animated></ion-skeleton-text>);
    return(
      <ion-grid className="ion-padding-horizontal">
        <ion-row>
          <ion-col size="12">
            {batches}
          </ion-col>
        </ion-row>
      </ion-grid>
    )
  }

  addButtons(){
    let self = this;
    const getButtons = function(){
      if (!self.stock)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      return (
        <ion-button slot="primary" onClick={() => self.navigateToTab('tab-batches', {gtin: self.gtin})}>
          <ion-icon name="file-tray-stacked-outline"></ion-icon>
        </ion-button>
      )
    }

    return(
      <ion-buttons className="ion-align-self-center ion-padding" slot="end">
        {getButtons()}
      </ion-buttons>
    )
  }

  render() {
    return (
      <Host>
        <ion-item className="ion-align-self-center main-item">
          {this.addBarCode()}
          {this.addLabel()}
          {this.addBatches()}
          {this.addButtons()}
        </ion-item>
      </Host>
    );
  }
}

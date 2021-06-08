import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebManagerService, WebManager} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
import {getBarCodePopOver} from "../../utils/popOverUtils";

const {Stock, Batch} = wizard.Model;

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
  @State() batches: typeof Batch[] = undefined;
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
      self.stock = new Stock(stock);
      self.batches = [...stock.batches];
      self.quantity = this.stock.getQuantity();
    });
  }

  @Watch('gtin')
  @Method()
  async refresh(){
    await this.loadStock();
  }

  addLabel(){
    const self = this;

    const getQuantityLabel = function(){
      if (!self.stock || !self.stock.description)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      return self.stock.quantity;
    }

    const getGtinLabel = function(){
      if (!self.stock || !self.stock.gtin)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return self.stock.gtin;
    }

    const getNameLabel = function(){
      if (!self.stock || !self.stock.name)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return self.stock.name;
    }

    return(
      <ion-label color="secondary">
        {getGtinLabel()}
        <span class="ion-padding-start">{getNameLabel()}</span>
        <span class="ion-padding-start">{getQuantityLabel()}</span>
      </ion-label>)
  }

  addBatches(){
    if (!this.stock || !this.batches)
      return (<ion-skeleton-text animated></ion-skeleton-text>);
    return(
      <pdm-item-organizer component-name="batch-chip"
                          component-props={JSON.stringify(this.batches.map(batch => ({
                            "gtin-batch": this.stock.gtin + '-' + batch.batchNumber,
                            "quantity": batch.quantity,
                            "mode": "detail",
                            "loader-type": SUPPORTED_LOADERS.bubblingSmall
                          })))}
                          id-prop="gtin-batch"
                          is-ion-item="false"></pdm-item-organizer>
    )
  }

  addButtons(){
    let self = this;
    if (!self.stock)
      return (<ion-skeleton-text animated></ion-skeleton-text>);

    const getButton = function(slot, color, icon, handler){
      return (
        <ion-button slot={slot} color={color} fill="clear" onClick={handler}>
          <ion-icon size="large" slot="icon-only" name={icon}></ion-icon>
        </ion-button>
      )
    }

    return [
      getButton("end", "medium", "barcode", (evt) => getBarCodePopOver({
        type: "code128",
        size: "32",
        scale: "6",
        data: self.gtin
      }, evt)),
      getButton("end", "medium", "eye", () => self.navigateToTab('tab-batches', {gtin: self.gtin}))
    ]
  }

  render() {
    return (
      <Host>
        <ion-item class="main-item ion-margin-bottom" lines="none" color="light">
          {this.addLabel()}
          <div class="ion-padding flex">
            {this.addBatches()}
          </div>
          {this.addButtons()}
        </ion-item>
      </Host>
    );
  }
}

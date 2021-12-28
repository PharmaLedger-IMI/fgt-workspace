import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebManagerService, WebManager} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
import {getBarCodePopOver} from "../../utils/popOverUtils";
import {ListItemLayout} from "../list-item-layout/list-item-layout";

const {Stock, Batch, IndividualProduct} = wizard.Model;

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

  @Event({
    eventName: 'fgt-track-request',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  trackRequestAction: EventEmitter;

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
  @Prop() isHeader: boolean;

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

    if(!self.isHeader || self.gtin !== "header")
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

  addBatches(){
    const self = this;

    if(self.isHeader){
      return (
            <ion-col slot="content" color="secondary" size= "auto">
              <div>
                {"Batches"}
              </div>       
            </ion-col>
      )
    }

    if (!this.stock || !this.batches)
      return (<ion-skeleton-text slot="content" animated></ion-skeleton-text>);
      
    const displayedBatches = this.batches.filter( (batch) => batch.quantity > 0);
    
    return(
      <pdm-item-organizer slot="content"  component-name="batch-chip"
                          component-props={JSON.stringify(displayedBatches.map(batch => ({
                            "gtin-batch": this.stock.gtin + '-' + batch.batchNumber,
                            "quantity": (new Batch(batch)).getQuantity(),
                            "status": batch.batchStatus.status,
                            "mode": "detail",
                            "loader-type": SUPPORTED_LOADERS.bubblingSmall
                          })))}
                          id-prop="gtin-batch"
                          is-ion-item="false"
                          display-count="2"
                          display-count-divider="326"
                          more-chips-position="start"
                          orientation={this.getOrientation()}
                          onSelectEvent={(evt) => {
                            evt.preventDefault();
                            evt.stopImmediatePropagation();
                            console.log('Selected', evt);
                            const gtinBatch = evt.detail.split('-');
                            self.trackRequestAction.emit(new IndividualProduct({
                              gtin: gtinBatch[0],
                              batchNumber: gtinBatch[1],
                              name: self.stock.name,
                              manufName: self.stock.manufName,
                            }))
                          }}> </pdm-item-organizer>
    )
  }

  private getOrientation(){
    const layoutEl: ListItemLayout = this.element.querySelector('list-item-layout-default');
    return layoutEl ? layoutEl.orientation : 'end';

  }

  addButtons(){
    let self = this;

    
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

    if(self.isHeader)
      return[
        getMockButton(),
        getMockButton()
      ]
    
    if (!self.stock)
      return (<ion-skeleton-text animated></ion-skeleton-text>);
    
    return [
      getButton("buttons", "medium", "barcode", (evt) => getBarCodePopOver({
        type: "code128",
        size: "32",
        scale: "6",
        data: self.gtin
      }, evt)),
      getButton("buttons", "medium", "eye", () => self.navigateToTab('tab-batches', {gtin: self.gtin}))
    ]
  }

  addGtinLabel(){
    const self = this;

    const getGtinLabel = function(){
      if(self.isHeader)
        return "Gtin";

      if (!self.stock || !self.stock.gtin)
        return (<ion-skeleton-text animated></ion-skeleton-text>);

      return self.stock.gtin;
    }

    return(
      <ion-label slot="label0" color="secondary">
          {getGtinLabel()}
      </ion-label>
    )
  }

  addQuantityLabel(){
    const self = this;

    const getQuantityLabel = function(){
      if(self.isHeader)
        return "QTY"; 

      if (!self.stock || !self.stock.batches)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      
      return (
          <ion-badge>
            {self.stock.getQuantity()}
          </ion-badge>
      )
    }

    return(
      <ion-label slot="label1" color="secondary">
        {getQuantityLabel()}
      </ion-label>
    )
  }

  addNameLabel(){
    const self = this;

    const getNameLabel = function(){
      if(self.isHeader)
        return "Product Name"

      if (!self.stock || !self.stock.name)
        return (<ion-skeleton-text animated></ion-skeleton-text>);

      return self.stock.name;
    }

    return(
      <ion-label slot="label2" color="secondary">
        {getNameLabel()}
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
          "xs": 2,
          "sm": 2,
          "md": 1,
          "lg": 1,
          "xl":1
        },
        center: true,
      },
      2 : {
        sizeByScreen: {
          "xs": 4,
          "sm": 4,
          "md": 3,
          "lg": 3,
          "xl":2
        },
        center: false,
      }    
    }

    return JSON.stringify(obj);
  }

  render() {
    return (
      <Host>
        
        <list-item-layout-default buttons={true}  label-col-config={this.generateLabelLayoutConfig()}>
          {this.addGtinLabel()}
          {this.addQuantityLabel()}
          {this.addNameLabel()}
          {this.addBatches()}
          {this.addButtons()}
        </list-item-layout-default>
      </Host>
    );
  }
}

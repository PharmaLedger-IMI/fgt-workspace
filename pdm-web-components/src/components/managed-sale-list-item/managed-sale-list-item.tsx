import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebManagerService, WebManager} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {getBarCodePopOver} from "../../utils/popOverUtils";
import {ListItemLayout} from "../list-item-layout/list-item-layout";

const {Sale} = wizard.Model;

@Component({
  tag: 'managed-sale-list-item',
  styleUrl: 'managed-sale-list-item.css',
  shadow: false,
})
export class ManagedSaleListItem {

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
      console.log(`Sale List Component: ${message}`, err);
  }

  private navigateToTab(tab: string,  props: any){
    const event = this.sendNavigateTab.emit({
      tab: tab,
      props: props
    });
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored byt all components...`);
  }

  @Prop({attribute: 'sale-ref', mutable: true}) saleRef: string;

  @Prop() isHeader: boolean;

  private saleManager: WebManager = undefined;

  @State() sale: typeof Sale = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.saleManager = await WebManagerService.getWebManager("SaleManager");
    return await this.loadSale();
  }

  private async loadSale() {
    if (!this.saleManager)
      return;
    if (!this.saleRef || this.saleRef.startsWith('@')) {
      this.sale = undefined;
      return;
    }

    const self = this;
    if(!self.isHeader)
      self.saleManager.getOne(this.saleRef, true, (err, sale) => {
        if (err)
          return self.sendError(`Could not get sale ${self.saleRef}`, err);
        self.sale = sale;
      });
  }

  @Watch('saleRef')
  @Method()
  async refresh(){
    await this.loadSale();
  }

  addLabel(){
    const self = this;

    const getIdLabel = function(){
      if(self.isHeader)
        return 'Sale ID';

      if (!self.sale || !self.sale.id)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return self.sale.id;
    }

    const getNameLabel = function(){
      if(self.isHeader)
        return 'Name';

      if (!self.sale || !self.sale.sellerId)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return self.sale.name;
    }

    if(this.isHeader)
      return(
        <ion-label slot="label" color="secondary">
          <ion-row>
            <ion-col col-12 col-sm align-self-end size-lg={3}>
              <span class="ion-padding-start">
              {getIdLabel()}
              </span>       
            </ion-col>
            <ion-col col-12 col-sm align-self-end size-lg={3}>
              <span class="ion-padding-start">
                {getNameLabel()}
              </span>    
            </ion-col>
          </ion-row>
      </ion-label>
      )

    return(
      <ion-label slot="label" color="secondary">
        {getIdLabel()}
        <span class="ion-padding-start">{getNameLabel()}</span>
      </ion-label>)
  }

  addBatches(){
    const self = this;

    if(self.isHeader){
      return (
        <ion-label slot="content" color="secondary">
          <ion-row>
            <ion-col col-12 col-sm align-self-end size-lg={6}>
                <span class="ion-padding-end">
                  {"Batches"}
                </span>       
            </ion-col>
          </ion-row>
        </ion-label>
      )
    }
    if (!this.sale)
      return (<ion-skeleton-text slot="content" animated></ion-skeleton-text>);

    const groupedByBatch = this.sale.productList.reduce((accum, ip) => {
      const key = `${ip.gtin}-${ip.batchNumber}-${ip.expiry}`;
      accum[key] = accum[key] || [];
      accum[key].push(ip.serialNumber);
      return accum;
    }, {})

    return(
      <pdm-item-organizer slot="content"  component-name="managed-individual-product-chip"
                          component-props={JSON.stringify(Object.keys(groupedByBatch).map(k => {
                            const [gtin, batch, expiry] = k.split('-');
                            return {
                              "id-prop": k,
                              "gtin": gtin,
                              "expiry": expiry,
                              "batch": batch,
                              "serials": JSON.stringify(groupedByBatch[k])
                            }
                          }))}
                          id-prop="id-prop"
                          is-ion-item="false"
                          display-count="3"
                          display-count-divider="248"
                          orientation={this.getOrientation()}
                          onSelectEvent={(evt) => {
                            evt.preventDefault();
                            evt.stopImmediatePropagation();
                            console.log(`Selected ${evt.detail}`);
                          }}></pdm-item-organizer>
    )
  }

  private getOrientation(){
    const layoutEl: ListItemLayout = this.element.querySelector('list-item-layout');
    return layoutEl ? layoutEl.orientation : 'end';

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
    
    if (!self.sale)
      return (<ion-skeleton-text animated></ion-skeleton-text>);

    const getButton = function(slot, color, icon, handler){
      return (
        <ion-button slot={slot} color={color} fill="clear" onClick={handler}>
          <ion-icon size="large" slot="icon-only" name={icon}></ion-icon>
        </ion-button>
      )
    }

    return [
      getButton("buttons", "medium", "barcode", (evt) => getBarCodePopOver({
        type: "code128",
        size: "32",
        scale: "6",
        data: self.saleRef
      }, evt)),
      getButton("buttons", "medium", "eye", () => self.navigateToTab('tab-sales', {saleRef: self.saleRef}))
    ]
  }

  render() {
    return (
      <Host>
        <list-item-layout>
          {this.addLabel()}
          {this.addBatches()}
          {this.addButtons()}
        </list-item-layout>
      </Host>
    );
  }
}

import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebResolver, WebManagerService} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {getBarCodePopOver} from "../../utils/popOverUtils";

const Order = wizard.Model.Order;

const ORDER_TYPE = {
  ISSUED: "issued",
  RECEIVED: 'received'
}

@Component({
  tag: 'managed-order-list-item',
  styleUrl: 'managed-order-list-item.css',
  shadow: false,
})
export class ManagedOrderListItem {

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

  @Prop({attribute: 'order-id'}) orderId: string;

  @Prop({attribute: 'type'}) type?: string = ORDER_TYPE.ISSUED;

  private orderManager: WebResolver = undefined;

  @State() order: typeof Order = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    const prefix = this.type.charAt(0).toUpperCase() + this.type.slice(1).toLowerCase();
    this.orderManager = await WebManagerService.getWebManager(`${prefix}OrderManager`);
    return await this.loadOrders();
  }

  async loadOrders(){
    let self = this;
    if (!self.orderManager)
      return;
    self.orderManager.getOne(self.orderId, true, (err, order) => {
      if (err){
        self.sendError(`Could not get Order with id ${self.orderId}`, err);
        return;
      }
      self.order = order;
    });
  }

  @Watch('orderId')
  @Method()
  async refresh(){
    await this.loadOrders();
  }

  addLabel(){
    const self = this;

    const getOrderIdLabel = function(){
      if (!self.order || !self.order.orderId)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      return self.order.orderId;
    }

    const getRequesterIdLabel = function(){
      if (!self.order || !self.order.requesterId)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      return self.order.requesterId;
    }

    return(
      <ion-label color="secondary">
        {getOrderIdLabel()}
        <span class="ion-padding-start">{getRequesterIdLabel()}</span>
      </ion-label>)
  }

  addOrderLines() {
    if (!this.order || !this.order.orderLines)
      return (<ion-skeleton-text animated></ion-skeleton-text>);
    return(
      <pdm-item-organizer component-name="managed-orderline-stock-chip"
                          component-props={JSON.stringify(this.order.orderLines.map(ol => ({
                            "gtin": ol.gtin,
                            "quantity": ol.quantity,
                            "mode": "detail"
                          })))}
                          id-prop="gtin"
                          is-ion-item="false"
                          display-count="3"
                          onSelectAction={gtin => console.log(`selected ${gtin}`)}></pdm-item-organizer>
    );
  }

  addButtons(){
    let self = this;
    if (!self.order)
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
        data: self.order.orderId
      }, evt)),
      getButton("end", "medium", "eye", () => self.navigateToTab('tab-order', {orderRef: self.order.orderId}))
    ]
  }

  render() {
    return (
      <Host>
        <ion-item class="ion-margin-bottom" lines="none" color="light">
          {this.addLabel()}
          <div class="ion-padding flex">
            {this.addOrderLines()}
          </div>
          {this.addButtons()}
        </ion-item>
      </Host>
    );
  }
}

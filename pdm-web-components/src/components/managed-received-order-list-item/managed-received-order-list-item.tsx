import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebResolver, WebManagerService} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {EVENT_SEND_ERROR} from "../../constants/events";

const Order = wizard.Model.Order;

@Component({
  tag: 'managed-received-order-list-item',
  styleUrl: 'managed-received-order-list-item.css',
  shadow: false,
})
export class ManagedOrderListItem {

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

  @Prop({attribute: 'order-id'}) orderId: string;

  @Prop({attribute: 'orderline-count'}) orderlineCount?: number = 4;

  private receivedOrderManager: WebResolver = undefined;

  @State() order: typeof Order = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.receivedOrderManager = await WebManagerService.getWebManager("ReceivedOrderManager");
    return await this.loadOrders();
  }

  async loadOrders(){
    let self = this;
    if (!self.receivedOrderManager)
      return;
    self.receivedOrderManager.getOne(self.orderId, true, (err, order) => {
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
        return (<h3><ion-skeleton-text animated></ion-skeleton-text> </h3>)
      return (<h3>{self.order.orderId}</h3>)
    }

    const getRequesterIdLabel = function(){
      if (!self.order || !self.order.requesterId)
        return (<h5><ion-skeleton-text animated></ion-skeleton-text> </h5>)
      return (<h5>{self.order.requesterId}</h5>)
    }

    return(
      <ion-label class="ion-padding-horizontal ion-align-self-center">
        {getOrderIdLabel()}
        {getRequesterIdLabel()}
      </ion-label>)
  }

  addOrderLine(orderLine){
    return(
      <managed-orderline-stock-chip gtin={orderLine.gtin} quantity={orderLine.quantity} mode="detail"></managed-orderline-stock-chip>
    )
  }

  addOrderLines() {
    let orderLines = (<ion-skeleton-text animated></ion-skeleton-text>);
    if (this.order && this.order.orderLines) {
      if (this.order.orderLines.length > this.orderlineCount) {
        orderLines = [...this.order.orderLines].slice(0, this.orderlineCount).map(ol => this.addOrderLine(ol));
        orderLines.push((
          <more-chip color="secondary" text="..."></more-chip>
        ));
      } else {
        orderLines = this.order.orderLines.map(ol => this.addOrderLine(ol));
      }
    }
    return (
      <ion-grid class="ion-padding-horizontal">
        <ion-row>
          <ion-col size="12">
            {orderLines}
          </ion-col>
        </ion-row>
      </ion-grid>
    );
  }

  addButtons(){
    let self = this;
    const getButtons = function(){
      if (!self.order)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      return (
        <ion-button slot="primary" onClick={() => self.navigateToTab('tab-order', {orderId: self.order.orderId, requesterId: self.order.requesterId})}>
          <ion-icon name="cog-outline"></ion-icon>
        </ion-button>
      )
    }

    return(
      <ion-buttons class="ion-align-self-center ion-padding" slot="end">
        {getButtons()}
      </ion-buttons>
    )
  }

  render() {
    return (
      <Host>
        <ion-item class="ion-align-self-center main-item">
          {this.addLabel()}
          {this.addOrderLines()}
          {this.addButtons()}
        </ion-item>
      </Host>
    );
  }
}

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

  private sendError(message: string, err?: object){
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err){
      console.log(`Order Component: ${message}`, err);
    }
  }

  @Prop({attribute: 'order-id'}) orderId: string;

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
      this.order = order;
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

    return(
      <ion-label className="ion-padding-horizontal ion-align-self-center">
        {getOrderIdLabel()}
      </ion-label>)
  }

  addRequester(){
    const self = this;

    const getRequesterIdLabel = function(){
      if (!self.order || !self.order.requesterId)
        return (<h5><ion-skeleton-text animated></ion-skeleton-text> </h5>)
      return (<h5>{self.order.requesterId}</h5>)
    }

    const getSenderIdLabel = function(){
      if (!self.order || !self.order.senderId)
        return (<h5><ion-skeleton-text animated></ion-skeleton-text> </h5>)
      return (<h5>{self.order.senderId}</h5>)
    }

    return(
      <ion-label className="ion-padding-horizontal ion-align-self-center">
        {getRequesterIdLabel()}
      </ion-label>)
  }

  addOrderLine(orderLine){
    return(
      <ion-chip outline color="primary">
        <ion-label className="ion-padding-horizontal">{orderLine.gtin}, {orderLine.quantity}</ion-label>
      </ion-chip>
    )
  }

  addOrderLines() {
    const self = this;
    let orderLines = (<ion-skeleton-text animated></ion-skeleton-text>);
    if (this.order && this.order.orderLines) {
      const maxOrderLines = 2; // truncate orderLines to 2 entries
      if (this.order.orderLines.length > maxOrderLines) {
        orderLines = [...this.order.orderLines].slice(0,2).map(ol => this.addOrderLine(ol));
        const suffix = ("...");
        orderLines.push(suffix);
      } else {
        orderLines = this.order.orderLines.map(ol => this.addOrderLine(ol));
      }
    }
    return (
      <ion-grid className="ion-padding-horizontal">
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
        <ion-button slot="primary">
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
        <ion-item className="ion-align-self-center">
          {this.addLabel()}
          {this.addRequester()}
          {this.addOrderLines()}
          {this.addButtons()}
        </ion-item>
      </Host>
    );
  }
}

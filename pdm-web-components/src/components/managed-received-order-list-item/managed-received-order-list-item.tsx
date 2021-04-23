import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebManager, WebManagerService} from '../../services/WebManagerService';
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

  @Prop() orderId: string;

  private receivedOrderManager: WebManager = undefined;

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

    const getRequesterIdLabel = function(){
      if (!self.order || !self.order.getRequesterIdLabel)
        return (<h5><ion-skeleton-text animated></ion-skeleton-text> </h5>)
      return (<h5>{self.order.getRequesterIdLabel}</h5>)
    }

    const getSenderIdLabel = function(){
      if (!self.order || !self.order.getSenderIdLabel)
        return (<h5><ion-skeleton-text animated></ion-skeleton-text> </h5>)
      return (<h5>{self.order.getSenderIdLabel}</h5>)
    }

    return(
      <ion-label className="ion-padding-horizontal ion-align-self-center">
        {getOrderIdLabel()}
        {getRequesterIdLabel()}
        {getSenderIdLabel()}
      </ion-label>)
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
          {this.addButtons()}
        </ion-item>
      </Host>
    );
  }
}

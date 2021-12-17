import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';

import {WebResolver, WebManagerService} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {getBarCodePopOver} from "../../utils/popOverUtils";
import {ListItemLayout} from "../list-item-layout/list-item-layout";

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

  @Prop() isHeader: boolean;

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

    if(!self.isHeader)
      self.orderManager.getOne(self.orderId, true, (err, order) => {
        if (err){
          self.sendError(`Could not get Order with id ${self.orderId}`, err);
          return;
        }
        self.order = {...order};
      });
  }

  @Watch('orderId')
  @Method()
  async refresh(newOrder?, oldOrder?){
    console.log(`New ${newOrder} and old ${oldOrder}`)
    await this.loadOrders();
  }

  addLabel(){
    const self = this;

    const getOrderIdLabel = function(){
      if(self.isHeader)
        return 'Order ID';

      if (!self.order || !self.order.orderId)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      return self.order.orderId;
    }

    const getRequesterIdLabel = function(){
      if(self.isHeader)
        return 'Requester ID';

      if (!self.order || !self.order.requesterId)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      return self.order.requesterId;
    }

    const buildLabelElement = (props: any) =>{
      return (
        <ion-col className="ion-padding-start" size="auto">
          <ion-label color="secondary">
            {props}
          </ion-label>
        </ion-col>
      )
    }

    const getStatusBadge = function(){
      if(self.isHeader)
        return 'Status';

      if (!self.order)
        return;
      return (
        <ion-col className="ion-padding-start" size="auto">
          <status-badge status={self.order.status.status}></status-badge>
        </ion-col>
      )
    }

    if(this.isHeader)
      return(
        <ion-label slot="label" color="secondary">
          <ion-row>
            <ion-col col-12 col-sm align-self-end size-lg={2}>
              <span class="ion-padding-start">
              {getOrderIdLabel()}
              </span>       
            </ion-col>
            <ion-col col-12 col-sm align-self-end size-lg={3}>
              <span class="ion-padding-start">
                {getRequesterIdLabel()}
              </span>    
            </ion-col>
            <ion-col col-12 col-sm align-self-end size-lg={1}>
              <span class="ion-padding-start">
                {getStatusBadge()}
              </span>    
            </ion-col>
          </ion-row>
      </ion-label>
      )

    return(
      <ion-row  slot="label" className="ion-align-items-center">
        {buildLabelElement(getOrderIdLabel())}
        {buildLabelElement(getRequesterIdLabel())}
        {getStatusBadge()}
      </ion-row>
    )
  }

  addOrderLines() {
    if(this.isHeader){
      return (
        <ion-label slot="content" color="secondary">
          <ion-row>
            <ion-col col-12 col-sm align-self-end size-lg={6}>
                <span class="ion-padding-end">
                  {"Order Lines"}
                </span>       
            </ion-col>
          </ion-row>
        </ion-label>
      )
    }

    if (!this.order || !this.order.orderLines)
      return (<ion-skeleton-text slot="content" animated></ion-skeleton-text>);
    return(
      <pdm-item-organizer slot="content" component-name="managed-orderline-stock-chip"
                          component-props={JSON.stringify(this.order.orderLines.map(ol => ({
                            "gtin": ol.gtin,
                            "quantity": ol.quantity,
                            "mode": "detail"
                          })))}
                          id-prop="gtin"
                          is-ion-item="false"
                          display-count="3"
                          display-count-divider="200"
                          orientation={this.getOrientation()}
                          onSelectEvent={(evt) => {
                            evt.preventDefault();
                            evt.stopImmediatePropagation();
                            console.log(`Selected ${evt.detail}`);
                          }}></pdm-item-organizer>
    );
  }

  private getOrientation(){
    const layout: ListItemLayout = this.element.querySelector('list-item-layout');
    return layout ? layout.orientation : 'end';
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

    if (!self.order)
      return (<ion-skeleton-text animated></ion-skeleton-text>);

    const getButton = function(slot, color, icon, handler){
      return (
        <ion-button slot={slot} color={color} fill="clear" onClick={handler}>
          <ion-icon size="large" slot="icon-only" name={icon}></ion-icon>
        </ion-button>
      )
    }

    const getProcessOrderButton = function(){
      if (self.type === ORDER_TYPE.ISSUED)
        return;
      return getButton("buttons", "medium", "cog",
        () => self.navigateToTab('tab-shipment', {
          mode: ORDER_TYPE.ISSUED,
          order: self.order
        }));
    }

    const getViewShipmentButton = function(){
      if (self.type !== ORDER_TYPE.ISSUED || !self.order || !self.order.shipmentId)
        return;
      return getButton("buttons", "medium", "subway",
        () => self.navigateToTab('tab-shipment', {
          mode: ORDER_TYPE.RECEIVED,
          shipment: {
            shipmentId: self.order.shipmentId,
            senderId: self.order.senderId
          }
        }));
    }

    const props = {
      mode: self.type,
      order: self.order
    };

    return [
      getButton("buttons", "medium", "barcode", (evt) => getBarCodePopOver({
        type: "code128",
        size: "32",
        scale: "6",
        data: self.order.orderId
      }, evt)),
      getButton("buttons", "medium", "eye", () => self.navigateToTab('tab-order', props)),
      getProcessOrderButton(),
      getViewShipmentButton()
    ]
  }

  render() {
    return (
      <Host>
        <list-item-layout>
          {this.addLabel()}
          {this.addOrderLines()}
          {this.addButtons()}
        </list-item-layout>
      </Host>
    );
  }
}

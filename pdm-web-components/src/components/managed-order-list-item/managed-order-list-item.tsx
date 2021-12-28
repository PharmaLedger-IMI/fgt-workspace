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

  addOrderLines() {
    const self = this;

    if(self.isHeader){
      return (
            <ion-col slot="content" color="secondary" size= "auto">
              <ion-label color="secondary">
                {"Order Lines"}
              </ion-label>       
            </ion-col>
      )
    }

    if(!self.order || !self.order.orderLines)
      return (<ion-skeleton-text slot="content" animated></ion-skeleton-text>);
    
    return(
      <pdm-item-organizer slot="content" component-name="managed-orderline-stock-chip"
                          component-props={JSON.stringify(self.order.orderLines.map(ol => ({
                            "gtin": ol.gtin,
                            "quantity": ol.quantity,
                            "mode": "detail"
                          })))}
                          id-prop="gtin"
                          is-ion-item="false"
                          display-count="3"
                          display-count-divider="200"
                          orientation={self.getOrientation()}
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
    
    const getButton = function(slot, color, icon, handler){
      return (
        <ion-button slot={slot} color={color} fill="clear" onClick={handler}>
          <ion-icon size="large" slot="icon-only" name={icon}></ion-icon>
        </ion-button>
      )
    }
    const getMockButton = function(iconName, disabled){
      return (
        <ion-button slot="buttons" color={disabled ? "danger":"secondary"} fill="clear" disabled="true">
          <ion-icon size="large" slot="icon-only" name={iconName ? iconName : "some-name"}></ion-icon>
          {/* <ion-icon size="large" slot="icon-only" name="information-circle-sharp"></ion-icon> */}
        </ion-button>
      )
    }

    const getProcessOrderButton = function(){
      if (self.type === ORDER_TYPE.ISSUED)
        return;

      if(self.isHeader)
        return getMockButton("", false);
      
      return getButton("buttons", "medium", "cog",
        () => self.navigateToTab('tab-shipment', {
          mode: ORDER_TYPE.ISSUED,
          order: self.order
        }));
    }

    const getViewShipmentButton = function(){
      if(self.type === ORDER_TYPE.RECEIVED)
        return;
      
      if(self.isHeader)
        return getMockButton("", false);
      
      if (!self.order.shipmentId || !self.order)
        return getMockButton("subway", true);
      
      return getButton("buttons", "medium", "subway",
      () => self.navigateToTab('tab-shipment', {
        mode: ORDER_TYPE.RECEIVED,
        shipment: {
          shipmentId: self.order.shipmentId,
          senderId: self.order.senderId
        }
      }));
    }
    
    if(self.isHeader)
    return[
      getMockButton("", false),
      getMockButton("", false),
      getProcessOrderButton(),
      getViewShipmentButton()
    ]
    
    if (!self.order)
      return (<ion-skeleton-text animated></ion-skeleton-text>);

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

  addOrderIDLabel(){
    const self = this;

    const getOrderIdLabel = function(){
      if(self.isHeader)
        return "Order ID";

      if (!self.order || !self.order.orderId)
        return (<ion-skeleton-text animated></ion-skeleton-text>)

      return self.order.orderId;
    }

    return(
      <ion-label slot="label0" color="secondary">
          {getOrderIdLabel()}
      </ion-label>
    )
  }

  addRequesterLabel(){
    const self = this;

    const getRequesterIdLabel = function(){
      if(self.isHeader) 
        return (self.type === ORDER_TYPE.ISSUED) ? "Sender ID" :"Requester ID";
      

      if (!self.order || !self.order.requesterId)
        return (<ion-skeleton-text animated></ion-skeleton-text>)

   
      return (self.type === ORDER_TYPE.ISSUED) ?  self.order.senderId : self.order.requesterId;

    }

    return(
      <ion-label slot="label1" color="secondary">
          {getRequesterIdLabel()}
      </ion-label>
    )
  }

  addStatusLabel(){
    const self = this;

    const getStatusBadge = function(){

      if(self.isHeader)
        return "Status";

      if (!self.order)
        return (<ion-skeleton-text animated></ion-skeleton-text>)

      return (   
          <status-badge status={self.order.status.status}></status-badge>
      )
    }

    return(
      <ion-label slot="label2" color="secondary">
        {getStatusBadge()}
      </ion-label>
    )
  }

  generateLabelLayoutConfig(){
    const obj = {
      0 : {
        sizeByScreen: {
          "xs": 4,
          "sm": 3,
          "md": 3,
          "lg": 3,
          "xl":2
        },
        center: false,
      },
      1 : {
        sizeByScreen: {
          "xs": 3,
          "sm": 3,
          "md": 2,
          "lg": 3,
          "xl":2
        },
        center: false,
      },
      2 : {
        sizeByScreen: {
          "xs": 3,
          "sm": 3,
          "md": 2,
          "lg": 2,
          "xl":2
        },
        center: true,
      }    
    }

    return JSON.stringify(obj);
  }

  render() {
    return (
      <Host>
        <list-item-layout-default buttons={true}  label-col-config={this.generateLabelLayoutConfig()}>
          {this.addOrderIDLabel()}
          {this.addRequesterLabel()}
          {this.addStatusLabel()}
          {this.addOrderLines()}
          {this.addButtons()}
        </list-item-layout-default>
      </Host>
    );
  }
}
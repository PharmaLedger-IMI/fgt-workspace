import {Component, Element, Event, EventEmitter, h, Method, Prop, State, Watch} from '@stencil/core';
import {WebManager, WebManagerService} from "../../services/WebManagerService";
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
import {HostElement} from "../../decorators";
import {EVENT_SEND_ERROR, EVENT_NAVIGATE_TAB} from "../../constants/events";


// @ts-ignore
const {Order, OrderLine, Stock} = require('wizard').Model;

@Component({
  tag: 'managed-received-order',
  styleUrl: 'managed-received-order.css',
  shadow: true,
})
export class ManagedReceivedOrder {

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
    eventName: EVENT_NAVIGATE_TAB,
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

  // private navigateToTab(tab: string,  props: any){
  //   const event = this.sendNavigateTab.emit({
  //     tab: tab,
  //     props: props
  //   });
  //   if (!event.defaultPrevented)
  //     console.log(`Tab Navigation request seems to have been ignored byt all components...`);
  // }

  @Prop({attribute: 'order-id', mutable: true}) orderId: string = undefined;

  @Prop({attribute: 'title-string'}) titleString: string = 'Process Order';

  @Prop({attribute: 'details-string'}) detailsString: string = 'Details';

  @Prop({attribute: 'products-string'}) productsString: string = 'Products:';

  @State() order: typeof Order = undefined;

  @State() orderLines: typeof OrderLine[] = undefined;

  @State() stockForProduct:  typeof Stock = undefined;

  private receivedOrderManager: WebManager = undefined;

  private stockManager: WebManager = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.receivedOrderManager = await WebManagerService.getWebManager("ReceivedOrderManager");
    this.stockManager = await WebManagerService.getWebManager("StockManager");
    return await this.loadOrder();
  }

  async loadOrder(){
    let self = this;
    await self.receivedOrderManager.getOne(this.orderId, true, (err, order) => {
      if (err)
        return this.sendError(`Could not retrieve order ${self.orderId}`);
      self.order = order;
    });
  }

  private async loadOrderLinesAsync(){
    const self = this;

    const result = [];

    const orderLineIterator = function(orderLinesCopy, callback){
      const orderLine = orderLinesCopy.shift();
      if (!orderLine)
        return callback(undefined, result);
      self.stockManager.getOne(orderLine.gtin, true, (err, stock) => {
        if (err){
          console.log(`Could not retrieve stock for product ${orderLine.gtin}`);
          result.push({
            orderLine: orderLine,
            stock: undefined
          })
          return orderLineIterator(orderLinesCopy, callback);
        }
        result.push({
          orderLine: orderLine,
          stock: stock
        });
        orderLineIterator(orderLinesCopy, callback);
      });
    }

    orderLineIterator(self.order.orderLines.slice(), (err, result) => {
      if (err)
        return console.log(err);
      result = result.sort((first, second) => {
        if (first.stock === second.stock)
          return 0;
        if (!!first.stock && !second.stock)
          return 1;
        if (!!second.stock && !first.stock)
          return -1;
        return first.stock.getQuantity() - second.stock.getQuantity();
      });
    });
  }

  @Watch('orderId')
  @Method()
  async refresh(){
    await this.loadOrder();
  }

  private getHeader(){
    return (
      <ion-card-header>
        <ion-card-title>{this.titleString}</ion-card-title>
        <ion-card-subtitle>{this.orderId}</ion-card-subtitle>
      </ion-card-header>
    )
  }

  private getLoading(type: string = SUPPORTED_LOADERS.simple){
    return (<multi-loader type={type}></multi-loader>);
  }

  private getMap(){
    return this.getLoading(SUPPORTED_LOADERS.circles);
  }

  private getLocalizationInfo(){
    return (
      <ion-item>
        <ion-item>
          <ion-label>{}</ion-label>
        </ion-item>
        <div slot="end">
          {this.getMap()}
        </div>
      </ion-item>
    )
  }

  private getContent(){
    const self = this;

    const getDetails = function(){
      if (!self.order)
        return self.getLoading();

      return [self.getLocalizationInfo()]
    }

    const getOrderLines = function(){

    }

    return (
      <ion-card-content>
        <ion-item-divider>
          <ion-label>{this.detailsString}</ion-label>
        </ion-item-divider>
        {getDetails()}
        <ion-item-divider>
          <ion-label>{this.productsString}</ion-label>
        </ion-item-divider>
        {getOrderLines()}
      </ion-card-content>
    )
  }

  render() {
    return (
      <ion-card>
        {this.getHeader()}
        {this.getContent()}
      </ion-card>
    );
  }
}

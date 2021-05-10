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
  shadow: false,
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

  @Prop({attribute: 'details-string'}) detailsString: string = 'Details:';

  @Prop({attribute: 'products-string'}) productsString: string = 'Products:';

  @Prop({attribute: 'available-string'}) availableString: string = 'Available:';

  @Prop({attribute: 'unavailable-string'}) unavailableString: string = 'Unavailable:';

  @Prop({attribute: 'stock-string'}) stockString: string = 'Stock:';

  @Prop({attribute: 'no-stock-string'}) noStockString: string = 'Empty';

  @State() order: typeof Order = undefined;

  @State() orderLines: typeof OrderLine[] = undefined;

  @State() stockForProduct: [] = undefined;

  @State() selectedProduct: number = undefined;

  private result: any = undefined;

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
    if (!this.orderId || this.orderId.startsWith('@')) // for webcardinal model compatibility
      return;
    await self.receivedOrderManager.getOne(this.orderId, true, async (err, order) => {
      if (err)
        return this.sendError(`Could not retrieve order ${self.orderId}`);
      self.order = order;
      await self.loadOrderLinesAsync();
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
          stock: new Stock(stock)
        });
        orderLineIterator(orderLinesCopy, callback);
      });
    }

    orderLineIterator(self.order.orderLines.slice(), (err, result) => {
      if (err)
        return console.log(err);
      self.result = result.sort((first, second) => {
        if (first.stock === second.stock)
          return 0;
        if (!!first.stock && !second.stock)
          return 1;
        if (!!second.stock && !first.stock)
          return -1;
        return first.stock.getQuantity() - second.stock.getQuantity();
      });
      self.orderLines = self.result.map(r => r.orderLine);
    });
  }

  @Watch('orderId')
  @Method()
  async refresh(){
    await this.loadOrder();
  }

  @Watch('selectedProduct')
  async selectProduct(oldGtin, newGtin){
    if (oldGtin === newGtin)
      return;
    this.stockForProduct = undefined;
    this.updateStock();
  }

  private updateStock(){
    const self = this;
    if (!self.result)
      this.stockForProduct = [];
    const productStock = this.result.filter(r => r.orderLine.gtin === self.selectedProduct);
    if (!productStock.length)
      self.stockForProduct = [];
    if (productStock.length !== 1)
      return self.sendError(`More than one stock reference received. should be impossible`);

    this.stockForProduct = productStock[0].stock.batches.sort((b1, b2) => {
      const date1 = new Date(b1.expiry).getTime();
      const date2 = new Date(b2.expiry).getTime();
      return date1 - date2;
    });
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
    return (<ion-icon slot="end" name="map-outline"></ion-icon>)
  }

  private getLocalizationInfo(){
    return (
      <ion-item>
        <ion-item>
          <ion-label>{this.order.shipToAddress}</ion-label>
        </ion-item>
        {this.getMap()}
      </ion-item>
    )
  }

  private getAvailableStock(){
    const self = this;

    const getEmpty = function(){
      return (<ion-item><ion-label>{self.noStockString}</ion-label></ion-item>)
    }

    const getBatch = function(batch){
        return(
          <ion-item>
            <batch-chip gtin-batch={self.selectedProduct + '-' + batch.batchNumber} mode="detail" quantity={batch.quantity}></batch-chip>
            <ion-reorder slot="end">
              <ion-icon name="pizza"></ion-icon>
            </ion-reorder>
          </ion-item>
        )
    }

    if (!self.stockForProduct)
      return self.getLoading('cube');
    if (!self.stockForProduct.length)
      return getEmpty()
    return (
      <ion-reorder-group disabled="false">
        {...self.stockForProduct.map(b => getBatch(b))}
      </ion-reorder-group>
    )
  }

  private selectOrderLine(gtin){
    this.selectedProduct = gtin;
  }

  private getContent(){
    const self = this;

    const getDetails = function(){
      if (!self.order)
        return self.getLoading();

      return self.getLocalizationInfo();
    }

    const getOrderLines = function(){
      if (!self.orderLines)
        return (self.getLoading());

      const genOrderLine = function(orderLine, available){
        return (
          <managed-orderline-stock-chip onClick={() => self.selectOrderLine(orderLine.gtin)} gtin={orderLine.gtin} quantity={orderLine.quantity} mode="detail" available={available}></managed-orderline-stock-chip>
        )
      }

      function getUnavailable(){
        const unavailable = self.result.filter(r => r.orderLine.quantity > r.stock.getQuantity());
        if (!unavailable.length)
          return [];
        const getHeader = function(){
          return (
            <ion-item-divider>{self.unavailableString}</ion-item-divider>
          )
        }
        const output = [getHeader()];
        unavailable.forEach(u => output.push(genOrderLine(u.orderLine, u.stock.getQuantity())));
        return output;
      }

      function getAvailable(){
        const available = self.result.filter(r => r.orderLine.quantity <= r.stock.getQuantity());
        if (!available.length)
          return [];
        const getHeader = function(){
          return (
            <ion-item-divider>{self.availableString}</ion-item-divider>
          )
        }
        const output = [getHeader()];
        available.forEach(u => output.push(genOrderLine(u.orderLine, u.stock.getQuantity())));
        return output;
      }

      return [...getUnavailable(), ...getAvailable()];
    }

    return (
      <ion-card-content>
        <ion-item-divider>
          <ion-label>{this.detailsString}</ion-label>
        </ion-item-divider>
        {getDetails()}
        <ion-grid>
          <ion-row>
            <ion-col size="6">
              <ion-item-group className="ion-no-padding">
                <ion-item-divider className="ion-padding-horizontal">
                  <ion-label>{this.productsString}</ion-label>
                </ion-item-divider>
                {...getOrderLines()}
              </ion-item-group>
            </ion-col>
            <ion-col size="6">
              <ion-item-group className="ion-no-padding">
                <ion-item-divider className="ion-padding-horizontal">
                  <ion-label>{this.stockString}</ion-label>
                </ion-item-divider>
                {self.getAvailableStock()}
              </ion-item-group>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-card-content>
    )
  }

  render() {
    return (
      <ion-card className="ion-margin">
        {this.getHeader()}
        {this.getContent()}
      </ion-card>
    );
  }
}

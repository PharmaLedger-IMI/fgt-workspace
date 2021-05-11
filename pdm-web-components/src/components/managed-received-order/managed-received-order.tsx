import {Component, Element, Event, EventEmitter, h, Listen, Method, Prop, State, Watch} from '@stencil/core';
import {WebManager, WebManagerService} from "../../services/WebManagerService";
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
import {HostElement} from "../../decorators";
import {EVENT_SEND_ERROR, EVENT_NAVIGATE_TAB} from "../../constants/events";

const ItemClasses = {
  selected: "selected",
  unnecessary: 'unnecessary',
  normal: 'normal',
  finished: 'finished'
}
// @ts-ignore
const {Order, OrderLine, Stock, Batch} = require('wizard').Model;

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

  @Prop({attribute: 'confirmed-string'}) confirmedString: string = 'Confirmed:';

  @Prop({attribute: 'stock-string'}) stockString: string = 'Stock:';

  @Prop({attribute: 'no-stock-string'}) noStockString: string = 'Empty';

  @Prop({attribute: 'select-product'}) selectProductString: string = 'Please Select a Product...';

  @Prop({attribute: 'remaining-string'}) remainingString: string = 'Remaining:';

  @State() order: typeof Order = undefined;

  @State() orderLines: typeof OrderLine[] = undefined;

  @State() stockForProduct = undefined;

  @State() selectedProduct: number = undefined;

  private result: any = undefined;

  private receivedOrderManager: WebManager = undefined;

  private stockManager: WebManager = undefined;

  private batchSeparatorIndex: any = {index: undefined};

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
  async selectProduct(newGtin, oldGtin){
    if (oldGtin === newGtin)
      return;
    if (!!this.orderLines.filter(o => o.gtin === newGtin)[0].confirmed)
      return;
    this.updateStock();
  }

  @Listen('ionItemReorder')
  async updateOrder(evt){
    const self = this;
    const getDifference = function(){
      return self.batchSeparatorIndex.hasNext ? 2 : 1;
    }
    const newStock = self.stockForProduct.slice();
    self.stockForProduct = undefined;
    const movedBatch = newStock.splice(evt.detail.from > this.batchSeparatorIndex.index ? evt.detail.from - getDifference() : evt.detail.from, 1);
    const result = [];
    if (evt.detail.to > 0)
      result.push(...newStock.slice(0, evt.detail.to));
    result.push(...movedBatch, ...newStock.slice(evt.detail.to, Number.MAX_VALUE));
    await evt.detail.complete();
    self.stockForProduct = [...result];
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
      <ion-card-header class="ion-padding">
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

  private splitStockByQuantity(stock?: any){
    stock = stock || this.stockForProduct.slice();
    const self = this;

    const getBatchSeparator = function(){
      return (
        <ion-item-divider>
          <ion-label class="ion-padding-horizontal">{self.remainingString}</ion-label>
        </ion-item-divider>
      )
    }

    const getBatch = function(batch, status = ItemClasses.normal){

      const getReorder = function(){
        if (status === ItemClasses.unnecessary)
          return;
        return (
          <ion-reorder slot="end">
            <ion-icon name="menu-outline"></ion-icon>
          </ion-reorder>
        )
      }

      return(
        <ion-item class={status} disabled={status === ItemClasses.unnecessary}>
          <batch-chip gtin-batch={self.selectedProduct + '-' + batch.batchNumber} mode="detail" quantity={batch.quantity}></batch-chip>
          {getReorder()}
        </ion-item>
      )
    }

    let accum = 0;
    self.batchSeparatorIndex = {index: undefined};
    const batches = [];
    const requiredQuantity = self.orderLines.filter(o => o.gtin === self.selectedProduct)[0].quantity
    stock.forEach((batch, i) => {
      if (accum >= requiredQuantity){
        batches.push(getBatch(batch));
        // @ts-ignore
      } else if (accum + batch.quantity > requiredQuantity) {
        const batch1 = new Batch(batch);
        const batch2 = new Batch(batch);
        batch1.quantity = requiredQuantity - accum;
        // @ts-ignore
        batch2.quantity = batch.quantity - batch1.quantity;
        batches.push(getBatch(batch1, ItemClasses.selected));
        batches.push(getBatchSeparator());
        self.batchSeparatorIndex = {
          index: batches.length - 1,
          hasNext: true
        };
        batches.push(getBatch(batch2, ItemClasses.unnecessary));
      } else if(accum + batch.quantity === requiredQuantity){
        batches.push(getBatch(batch, ItemClasses.selected));
        if (i < stock.length - 1){
          batches.push(getBatchSeparator());
          self.batchSeparatorIndex = {
            index: batches.length - 1,
            hasNext: false
          };
        }
      } else {
        batches.push(getBatch(batch, ItemClasses.selected));
      }
      // @ts-ignore
      accum += batch.quantity;
    });

    return batches;
  }

  private getAvailableStock(){
    const self = this;

    const getEmpty = function(){
      return (<ion-item><ion-label>{self.noStockString}</ion-label></ion-item>)
    }

    const getSelectProduct = function(){
      return (<ion-item><ion-label>{self.selectProductString}</ion-label></ion-item>)
    }

    if (!self.selectedProduct)
      return getSelectProduct();
    if (!self.stockForProduct)
      return self.getLoading(SUPPORTED_LOADERS.cube);
    if (!self.stockForProduct.length)
      return getEmpty();

    const stockElements = this.splitStockByQuantity();
    return (
      <ion-reorder-group disabled={false}>
        {...stockElements}
      </ion-reorder-group>
    )
  }

  @Method()
  async selectOrderLine(gtin){
    this.selectedProduct = gtin;
  }

  private getDetails(){
    if (!this.order)
      return this.getLoading();

    return this.getLocalizationInfo();
  }

  private markProductAsConfirmed(gtin, confirmed = true){
    let orderLine = this.orderLines.filter(o => o.gtin === gtin);
    if (orderLine.length !== 1)
      return;
    orderLine = orderLine[0];
    // @ts-ignore
    orderLine.confirmed = confirmed;
    this.selectedProduct = undefined;
    this.orderLines = [...this.orderLines];
  }

  private getOrderLines(){
    const self = this;
    if (!self.orderLines)
      return [self.getLoading(SUPPORTED_LOADERS.medical)];

    const genOrderLine = function(orderLine, available){

      const getButton = function(){
        if (orderLine.gtin !== self.selectedProduct)
          return undefined;
        return {
          button: !! orderLine.confirmed ? "cancel" : "confirm"
        }
      }

      const receiveAction = function(evt){
        evt.preventDefault();
        evt.stopImmediatePropagation();
        const {gtin, action} = evt.detail.data;
        self.markProductAsConfirmed(gtin, action === "confirmed");
      }

      return (
          <managed-orderline-stock-chip onSendAction={receiveAction}
                                        onClick={() => self.selectOrderLine(orderLine.gtin)}
                                        gtin={orderLine.gtin}
                                        quantity={orderLine.quantity}
                                        mode="detail"
                                        available={available}
                                        {...getButton()}></managed-orderline-stock-chip>
      )
    }

    function getUnavailable(){
      const unavailable = self.result.filter(r => r.orderLine.quantity > r.stock.getQuantity() && !r.orderLine.confirmed);
      if (!unavailable.length)
        return [];
      const getHeader = function(){
        return (
          <ion-item-divider class="ion-padding-horizontal">{self.unavailableString}</ion-item-divider>
        )
      }
      const output = [getHeader()];
      unavailable.forEach(u => output.push(genOrderLine(u.orderLine, u.stock.getQuantity())));
      return output;
    }

    function getAvailable(){
      const available = self.result.filter(r => r.orderLine.quantity <= r.stock.getQuantity() && !r.orderLine.confirmed);
      if (!available.length)
        return [];
      const getHeader = function(){
        return (
          <ion-item-divider class="ion-padding-horizontal">{self.availableString}</ion-item-divider>
        )
      }
      const output = available.length === self.result.length ? [] : [getHeader()];
      available.forEach(u => output.push(genOrderLine(u.orderLine, u.stock.getQuantity())));
      return output;
    }

    function getConfirmed(){
      const confirmed = self.result.filter(r => !!r.orderLine.confirmed);
      if (!confirmed.length)
        return [];
      const getHeader = function(){
        return (
          <ion-item-divider class="ion-padding-horizontal">{self.confirmedString}</ion-item-divider>
        )
      }
      const output = confirmed.length === self.result.length ? [] : [getHeader()];
      confirmed.forEach(u => output.push(genOrderLine(u.orderLine, u.stock.getQuantity())));
      return output;
    }

    return [...getUnavailable(), ...getAvailable(), ...getConfirmed()];
  }

  render() {
    return (
      <ion-card class="ion-margin">
        {this.getHeader()}
        <ion-card-content>
          <ion-item-divider>
            <ion-label>{this.detailsString}</ion-label>
          </ion-item-divider>
          {this.getDetails()}
          <ion-grid>
            <ion-row>
              <ion-col size="6">
                <ion-item-group>
                  <ion-item-divider class="ion-padding-horizontal">
                    <ion-label>{this.productsString}</ion-label>
                  </ion-item-divider>
                  {...this.getOrderLines()}
                </ion-item-group>
              </ion-col>
              <ion-col size="6">
                <ion-item-group>
                  <ion-item-divider class="ion-padding-horizontal">
                    <ion-label>{this.stockString}</ion-label>
                  </ion-item-divider>
                  {this.getAvailableStock()}
                </ion-item-group>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
    );
  }
}

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
const {Order, OrderLine, Stock, Batch, Shipment, ShipmentStatus, ShipmentLine} = require('wizard').Model;

@Component({
  tag: 'managed-issued-shipment',
  styleUrl: 'managed-issued-shipment.css',
  shadow: false,
})
export class ManagedIssuedShipment {

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

  /**
   * Through this event shipment creation requests are made
   */
  @Event({
    eventName: 'created',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendCreateEvent: EventEmitter;

  /**
   * Through this event shipment rejection requests are made
   */
  @Event({
    eventName: 'rejected',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendRejectEvent: EventEmitter;

  private sendAction(action: string, props){
    let handler;
    switch (action){
      case ShipmentStatus.REJECTED:
        handler = this.sendRejectEvent;
        break;
      case ShipmentStatus.CREATED:
        handler = this.sendCreateEvent;
        break;
      default:
        return console.log(`invalid action`);
    }
    const event = handler.emit(this.buildShipment(Object.keys(props).reduce((accum, key) => {
      accum[key] = props[key].selected
      return accum;
    }, {})));
    if (!event.defaultPrevented)
      console.log(`Action ${action} with props: ${props} not handled`);
  }

  private buildShipment(props){
    const self = this;
    const buildShipmentLine = function(batch){
      return new ShipmentLine({
        gtin: props.gtin,
        quantity: batch.quantity,
        batch: batch.batchNumber,
        requesterId: self.shipment.requesterId
      });
    }

    const shipment = new Shipment(undefined, undefined, this.shipment.requesterId, undefined, this.shipment.shipToAddress);
    shipment.shipmentLines = Object.keys(props).map(gtin => props[gtin].map(b => buildShipmentLine(b)));
    return shipment;
  }

  @Prop({attribute: 'shipment-id', mutable: true}) shipmentId: string = undefined;

  @Prop({attribute: 'title-string'}) titleString: string = 'Process Shipment';

  @Prop({attribute: 'details-string'}) detailsString: string = 'Details:';

  @Prop({attribute: 'products-string'}) productsString: string = 'Products:';

  @Prop({attribute: 'available-string'}) availableString: string = 'Available:';

  @Prop({attribute: 'unavailable-string'}) unavailableString: string = 'Unavailable:';

  @Prop({attribute: 'confirmed-string'}) confirmedString: string = 'Confirmed:';

  @Prop({attribute: 'stock-string'}) stockString: string = 'Stock:';

  @Prop({attribute: 'no-stock-string'}) noStockString: string = 'Empty';

  @Prop({attribute: 'select-product'}) selectProductString: string = 'Please Select a Product...';

  @Prop({attribute: 'remaining-string'}) remainingString: string = 'Remaining:';

  @Prop({attribute: 'reject-string'}) rejectString: string = 'Reject';

  @Prop({attribute: 'proceed-string'}) proceedString: string = 'Continue:';

  @Prop({attribute: 'delay-string'}) delayString: string = 'Delay:';

  @State() shipment: typeof Shipment = undefined;

  @State() orderLines: typeof ShipmentLine[] = undefined;

  @State() stockForProduct = undefined;

  @State() selectedProduct: number = undefined;

  private result: any = undefined;

  private shipmentLines = {};

  private issuedShipmentManager: WebManager = undefined;

  private stockManager: WebManager = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.issuedShipmentManager = await WebManagerService.getWebManager("IssuedShipmentManager");
    this.stockManager = await WebManagerService.getWebManager("StockManager");
    return await this.loadShipment();
  }

  async loadShipment(){
    let self = this;
    if (!this.shipmentId || this.shipmentId.startsWith('@')) // for webcardinal model compatibility
      return;

    self.issuedShipmentManager.getOne(this.shipmentId, true, async (err, shipment) => {
      if (err)
        return this.sendError(`Could not retrieve order ${self.shipmentId}`);
      self.shipment = shipment;
      self.loadShipmentLines((err, lines) => {
        if (err)
          return;
        lines.forEach(line => {
          self.updateStock(line.gtin, lines);
        });
      });
    });
  }

  private recreateOrderLines(shipmentLines){
    const byGtin = shipmentLines.reduce((accum, sl) => {
      (accum[sl['gtin']] = accum[sl['gtin']] || []).push(sl);
      return accum
    }, {});
    return Object.keys(byGtin).map(gtin => {
      const quantity = byGtin[gtin].reduce((acc, sl) => acc + sl.quantity, 0);
      const requesterId = byGtin[gtin][0].requesterId;
      const senderId = byGtin[gtin][0].senderId;
      return new OrderLine(gtin, quantity, requesterId, senderId);
    });
  }

  private loadShipmentLines(callback?){
    const self = this;

    const result = [];

    const shipmentLineIterator = function(linesCopy, callback){
      const shipmentLine = linesCopy.shift();
      if (!shipmentLine)
        return callback(undefined, result);
      self.stockManager.getOne(shipmentLine.gtin, true, (err, stock) => {
        if (err){
          console.log(`Could not retrieve stock for product ${shipmentLine.gtin}`);
          result.push({
            orderLine: shipmentLine,
            stock: undefined
          })
          return shipmentLineIterator(linesCopy, callback);
        }
        result.push({
          orderLine: shipmentLine,
          stock: new Stock(stock)
        });
        shipmentLineIterator(linesCopy, callback);
      });
    }

    shipmentLineIterator(self.recreateOrderLines(self.shipment.shipmentLines), (err, result) => {
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
      self.orderLines = self.result.map(r => r.shipmentLine);
      if (callback)
        callback(undefined, self.shipment.shipmentLines);
    });
  }

  @Watch('shipmentId')
  @Method()
  async refresh(){
    await this.loadShipment();
  }

  @Watch('selectedProduct')
  async selectProduct(newGtin, oldGtin){
    if (!newGtin || oldGtin === newGtin)
      return;
    if (!!this.result.filter(r => r.orderLine.gtin === newGtin)[0].confirmed)
      return;
    this.stockForProduct = {...this.updateStock(newGtin)};
  }

  @Listen('ionItemReorder')
  async updateOrder(evt){
    const self = this;
    const getDifference = function(){
      return (!!self.stockForProduct.divided ? 1 : 0) + (!!self.stockForProduct.remaining.length ? 1 : 0);
    }
    const newStock = self.stockForProduct.slice();
    const movedBatch = newStock.splice(evt.detail.from > self.stockForProduct.selected.length ? evt.detail.from - getDifference() : evt.detail.from, 1);
    self.stockForProduct = undefined;
    const result = [];
    if (evt.detail.to > 0)
      result.push(...newStock.slice(0, evt.detail.to));
    result.push(...movedBatch, ...newStock.slice(evt.detail.to, Number.MAX_VALUE));
    await evt.detail.complete();
    self.stockForProduct = [...result];
  }

  private updateStock(gtin, shipmentLines?){
    const self = this;
    if (gtin in self.shipmentLines)
      return self.shipmentLines[gtin];
    if (!self.result)
      this.stockForProduct = {};
    const productStock = this.result.filter(r => r.orderLine.gtin === gtin);
    if (!productStock.length)
      self.stockForProduct = {};
    if (productStock.length !== 1)
      return self.sendError(`More than one stock reference received. should be impossible`);

    const result = productStock[0].stock.batches.sort((b1, b2) => {
      const date1 = new Date(b1.expiry).getTime();
      const date2 = new Date(b2.expiry).getTime();
      return date1 - date2;
    });

    self.shipmentLines[gtin] = self.splitStockByQuantity(result, gtin, shipmentLines);
    return self.shipmentLines[gtin];
  }



  private getActionButtons(){

    const self = this;
    const getButton = function(action, color, text, enabled = true, margin = true, visible = true){
      return (
        <ion-button class={`${!visible ? 'ion-hide' : ''} ${!!margin ? 'ion-margin-horizontal' : ''}`}
                    color={color} size="small"
                    fill="outline"
                    disabled={!enabled}
                    onClick={() => self.sendAction(action, self.shipmentLines)}>
          <ion-label>{text}</ion-label>
        </ion-button>
      )
    }
    return (
      <ion-buttons class="ion-float-end ion-justify-content-end">
        {getButton(ShipmentStatus.REJECTED, "danger", self.rejectString, true, false)}
        {getButton(ShipmentStatus.ON_HOLD, "warning", self.delayString, true, true,false)}
        {getButton(ShipmentStatus.CREATED, "success", self.proceedString, self.result && self.result.length === self.result.filter(r => r.orderLine.confirmed).length, false)}
      </ion-buttons>
    )
  }

  private getHeader(){
    return (
      <ion-card-header class="ion-padding">
        <ion-card-title>
          {this.titleString}
          {this.getActionButtons()}
        </ion-card-title>
        <ion-card-subtitle>{this.shipmentId}</ion-card-subtitle>
      </ion-card-header>
    )
  }

  private getLoading(type: string = SUPPORTED_LOADERS.simple){
    return (<multi-loader type={type}></multi-loader>);
  }

  private getMap(){
    return (
      <ion-thumbnail>
        <ion-icon slot="end" name="map-outline"></ion-icon>
      </ion-thumbnail>
    )
  }

  private getLocalizationInfo(){
    return (
      <ion-item class="ion-no-padding">
        <ion-item class="ion-no-padding">
          <ion-label>{this.shipment.shipToAddress}</ion-label>
        </ion-item>
        {this.getMap()}
      </ion-item>
    )
  }

  private splitStockByQuantity(stock: any, gtin, shipmentLines?){
    const self = this;
    let accum = 0;
    const result = {
      selected: [],
      divided: undefined,
      remaining: []
    };

    if (shipmentLines) {
      const getStockIndex = function (shipmentLine) {
        for (let stockIndex = 0; stockIndex < stock.length; stockIndex++) {
          if (stock[stockIndex].gtin === shipmentLine.gtin)
            return stockIndex
        }
        return -1;
      }

      for (let slIndex = shipmentLines.length - 1; slIndex >= 0; slIndex--){
        const sl = shipmentLines[slIndex];
        const stockIndex = getStockIndex(sl);
        if (stockIndex === -1){
          // TODO handle missing stock (means other user has used up the stock)
          continue;
        }

        stock.unshift(stock.splice(stockIndex, 1));
      }
    }

    const requiredQuantity = self.result.filter(r => r.orderLine.gtin === gtin)[0].orderLine.quantity
    stock.forEach(batch => {
      if (accum >= requiredQuantity){
        result.remaining.push(batch);
        // @ts-ignore
      } else if (accum + batch.quantity > requiredQuantity) {
        const batch1 = new Batch(batch);
        const batch2 = new Batch(batch);
        batch1.quantity = requiredQuantity - accum;
        // @ts-ignore
        batch2.quantity = batch.quantity - batch1.quantity;
        result.selected.push(batch1);
        result.divided = batch2
      } else if(accum + batch.quantity === requiredQuantity){
        result.selected.push(batch)
      } else {
        result.selected.push(batch);
      }
      // @ts-ignore
      accum += batch.quantity;
    });

    return result;
  }

  private getAvailableStock(){
    const self = this;

    const getEmpty = function(){
      return (<ion-item><ion-label>{self.noStockString}</ion-label></ion-item>)
    }

    const getSelectProduct = function(){
      return (<ion-item><ion-label>{self.selectProductString}</ion-label></ion-item>)
    }

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

    if (!self.selectedProduct)
      return getSelectProduct();
    if (!self.stockForProduct)
      return self.getLoading(SUPPORTED_LOADERS.cube);
    if (self.stockForProduct.selected.length + self.stockForProduct.remaining.length + (self.stockForProduct.divided ? 1 : 0) === 0)
      return getEmpty();

    return (
      <ion-reorder-group disabled={false}>
        {...this.stockForProduct.selected.map(s => getBatch(s, ItemClasses.selected))}
        {!!this.stockForProduct.divided || !!this.stockForProduct.remaining.length ? getBatchSeparator() : ''}
        {getBatch(this.stockForProduct.divided, ItemClasses.unnecessary)}
        {...this.stockForProduct.remaining.map(r => getBatch(r, ItemClasses.normal))}
      </ion-reorder-group>
    )
  }

  @Method()
  async selectOrderLine(gtin){
    this.selectedProduct = gtin;
  }

  private getDetails(){
    if (!this.shipment)
      return this.getLoading();

    return this.getLocalizationInfo();
  }

  private markProductAsConfirmed(gtin, confirmed = true){
    let orderLine = this.result.filter(r => r.orderLine.gtin === gtin);
    if (orderLine.length !== 1)
      return;
    orderLine = orderLine[0].orderLine;
    this.updateStock(gtin)
    // @ts-ignore
    orderLine.confirmed = confirmed;
    this.selectedProduct = undefined;
    this.orderLines = this.result.map(r => r.orderLine);
  }

  private markAllAsConfirmed(confirm = true){
    if (confirm){
      const available = this.result.filter(r => r.orderLine.quantity <= r.stock.getQuantity() && !r.orderLine.confirmed);
      if (!available.length)
        return;
      available.forEach(a => {
        this.updateStock(a.orderLine.gtin);
        a.orderLine.confirmed = true
      });
    } else {
      const confirmed = this.result.filter(r => !!r.orderLine.confirmed);
      if (!confirmed.length)
        return;
      confirmed.forEach(c => c.orderLine.confirmed = false);
    }

    this.selectedProduct = undefined;
    this.orderLines = this.result.map(r => r.orderLine);
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
        self.markProductAsConfirmed(gtin, action === "confirm");
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
          <ion-item-divider>{self.unavailableString}</ion-item-divider>
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
          <ion-item-divider>
            {self.availableString}
            <ion-button color="success" slot="end" fill="clear" size="small" class="ion-float-end" onClick={() => self.markAllAsConfirmed()}>
              <ion-icon slot="icon-only" name="checkmark-circle-outline"></ion-icon>
            </ion-button>
          </ion-item-divider>
        )
      }
      const output = [getHeader()];
      available.forEach(u => output.push(genOrderLine(u.orderLine, u.stock.getQuantity())));
      return output;
    }

    function getConfirmed(){
      const confirmed = self.result.filter(r => !!r.orderLine.confirmed);
      if (!confirmed.length)
        return [];
      const getHeader = function(){
        return (
          <ion-item-divider>
            {self.confirmedString}
            <ion-button color="danger" slot="end" fill="clear" size="small" class="ion-float-end" onClick={() => self.markAllAsConfirmed(false)}>
              <ion-icon slot="icon-only" name="close-circle-outline"></ion-icon>
            </ion-button>
          </ion-item-divider>
        )
      }
      const output = [getHeader()];
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
                  <ion-item-divider>
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

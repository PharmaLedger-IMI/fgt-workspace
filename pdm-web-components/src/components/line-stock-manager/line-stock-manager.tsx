import {Component, Host, h, Method, Listen, Element, Event, EventEmitter, Prop, State, Watch} from '@stencil/core';
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
import {HostElement} from "../../decorators";
import {WebManager, WebManagerService} from "../../services/WebManagerService";
import wizard from "../../services/WizardService";

const ItemClasses = {
  selected: "selected",
  unnecessary: 'unnecessary',
  normal: 'normal',
  finished: 'finished'
}

const {Stock, utils} = wizard.Model;

@Component({
  tag: 'line-stock-manager',
  styleUrl: 'line-stock-manager.css',
  shadow: false,
})
export class LineStockManager {

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
      console.log(`Orderline Stock Manager Component: ${message}`, err);
  }

  private navigateToTab(tab: string,  props: any){
    const event = this.sendNavigateTab.emit({
      tab: tab,
      props: props
    });
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored by all components...`);
  }

  /**
   * Through this select events are sent
   */
  @Event()
  selectEvent: EventEmitter<string>;

  @Prop({attribute: 'lines', mutable: true, reflect: true}) lines: any[] = undefined;
  @Prop({attribute: 'show-stock', mutable: true, reflect: true}) showStock: boolean = false;
  @Prop({attribute: 'enable-actions', mutable: true, reflect: true}) enableActions: boolean = false;

  // Strings
  @Prop({attribute: 'lines-string'}) linesString: string = 'Lines:';
  @Prop({attribute: 'stock-string'}) stockString: string = 'Stock:';
  @Prop({attribute: 'no-stock-string'}) noStockString: string = 'Empty';
  @Prop({attribute: 'select-string'}) selectString: string = 'Please Select an Item...';
  @Prop({attribute: 'remaining-string'}) remainingString: string = 'Remaining:';
  @Prop({attribute: 'order-missing-string'}) orderMissingString: string = 'Order Missing';
  @Prop({attribute: 'available-string'}) availableString: string = 'Available:';
  @Prop({attribute: 'unavailable-string'}) unavailableString: string = 'Unavailable:';
  @Prop({attribute: 'confirmed-string'}) confirmedString: string = 'Confirmed:';
  @Prop({attribute: 'confirm-all-string'}) confirmAllString: string = 'Confirm All';
  @Prop({attribute: 'reset-all-string'}) resetAllString: string = 'Reset All';

  private stockManager: WebManager = undefined;

  @State() stockForProduct = undefined;
  @State() selectedProduct: number = undefined;

  @State() result: any[] = undefined;
  @State() shipmentLines = {};

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
    if (!this.showStock)
      return;
    this.stockManager = await WebManagerService.getWebManager("StockManager");
    await this.loadStockForOrderLines();
  }

  @Method()
  async reset(){
    this.result = [];
    this.shipmentLines = {};
    this.stockForProduct = undefined;
    this.selectedProduct = undefined;
  }

  @Method()
  async getResult(){
    return this.result;
  }

  @Watch('lines')
  @Method()
  async refresh(newVal){
    if (typeof newVal !== 'string')
      await this.loadStockForOrderLines();
  }

  @Watch('showStock')
  async loadStockManager(newVal){
    if (typeof newVal === 'boolean' && newVal)
      this.stockManager = this.stockManager || await WebManagerService.getWebManager("StockManager");
  }

  @Watch('selectedProduct')
  async selectProduct(newGtin, oldGtin){
    if (!newGtin || oldGtin === newGtin)
      return;
    if (!this.showStock)
      return;
    if (!!this.result.filter(r => r.orderLine.gtin === newGtin)[0].confirmed)
      return;
    this.stockForProduct = {...this.updateStock(newGtin)};
  }

  private loadStockForOrderLines(){
    const self = this;

    if (!self.stockManager)
      return;

    if (!self.lines || typeof self.lines === 'string' || !self.lines.length)
      return self.reset();

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

    orderLineIterator(self.lines.slice(), (err, result) => {
      if (err)
        return console.log(err);
      self.result = [...result.sort((first, second) => {
        if (first.stock === second.stock)
          return 0;
        if (!!first.stock && !second.stock)
          return 1;
        if (!!second.stock && !first.stock)
          return -1;
        return first.stock.getQuantity() - second.stock.getQuantity();
      })];
    });
  }

  private getLoading(type: string = SUPPORTED_LOADERS.simple){
    return (<multi-loader type={type}></multi-loader>);
  }

  private selectLine(gtin){
    this.selectEvent.emit(gtin);
    this.selectedProduct = gtin;
  }

  @Method()
  async cancelLine(gtin){
    if (gtin){
      if (!this.lines)
        return;
      let index;
      this.lines.every((ol, i) => {
        if (ol.gtin !== gtin)
          return true;
        index = i;
        return false;
      });
      if (index === undefined)
        return;
      this.lines.splice(index,1);
      this.lines = [... this.lines];
    }
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

  private updateStock(gtin){
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

    const result = productStock[0].stock ? utils.sortBatchesByExpiration(productStock[0].stock.batches) : [];

    // self.shipmentLines[gtin] = self.splitStockByQuantity(result, gtin);
    self.shipmentLines[gtin] = utils.splitStockByQuantity(result, self.result.filter(r => r.orderLine.gtin === gtin)[0].orderLine.quantity);
    return self.shipmentLines[gtin];
  }

  private getAvailableStock(){
    const self = this;

    const getStockHeader = function(){
      return (
        <ion-item-divider class="ion-margin-bottom">
          {self.stockString}
        </ion-item-divider>
      )
    }

    const getEmpty = function(){
      return (
          <ion-label color="medium">
            {self.noStockString}
          </ion-label>
        )
    }

    const getSelectProduct = function(){
      return (
        <ion-label color="medium">
          {self.selectString}
        </ion-label>
      )
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
      return [getStockHeader(), getSelectProduct()];
    if (!self.stockForProduct)
      return [getStockHeader(), self.getLoading(SUPPORTED_LOADERS.bubbling)];
    if (self.stockForProduct.selected.length + self.stockForProduct.remaining.length + (self.stockForProduct.divided ? 1 : 0) === 0)
      return [getStockHeader(), getEmpty()];

    return [
      getStockHeader(),
      <ion-reorder-group disabled={false}>
        {...this.stockForProduct.selected.map(s => getBatch(s, ItemClasses.selected))}
        {!!this.stockForProduct.divided || !!this.stockForProduct.remaining.length ? getBatchSeparator() : ''}
        {!!this.stockForProduct.divided ? getBatch(this.stockForProduct.divided, ItemClasses.unnecessary) : ''}
        {...this.stockForProduct.remaining.map(r => getBatch(r, ItemClasses.normal))}
      </ion-reorder-group>
    ]
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
    this.lines = this.result.map(r => r.orderLine);
  }

  private markAllAsConfirmed(confirm = true){
    if (confirm){
      const available = this.result.filter(r => r.stock && r.orderLine.quantity <= r.stock.getQuantity() && !r.orderLine.confirmed);
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

    this.selectLine(undefined)
    this.lines = this.result.map(r => r.orderLine);
  }

  @Listen('ssapp-action')
  async receiveAction(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const {gtin, action} = evt.detail;
    if (action === 'cancel')
      return this.cancelLine(gtin);
    this.markProductAsConfirmed(gtin, action === "confirm");
  }

  private genLine(orderLine, available?){
    const self = this;
    const getButton = function(){
      if (!self.enableActions || orderLine.gtin !== self.selectedProduct)
        return undefined;
      return {
        button: !! orderLine.confirmed && available < orderLine.quantity ? "cancel" : "confirm"
      }
    }

    return (
      <managed-orderline-stock-chip onClick={() => self.selectLine(orderLine.gtin)}
                                    gtin={orderLine.gtin}
                                    quantity={orderLine.quantity}
                                    mode="detail"
                                    button={getButton()}
                                    available={available || undefined}
                                    {...getButton()}></managed-orderline-stock-chip>
    )
  }

  private getOrderLines(){
    const self = this;
    if (!self.result)
      return [self.getLoading(SUPPORTED_LOADERS.cube)];

    function getUnavailable(){
      const unavailable = self.result.filter(r => (!r.stock || r.orderLine.quantity > r.stock.getQuantity()) && !r.orderLine.confirmed);
      if (!unavailable.length)
        return [];
      const getHeader = function(){
        return (
          <ion-item-divider class="ion-margin-bottom">
            {self.unavailableString}
            <ion-button color="primary" slot="end" fill="clear" size="small" class="ion-float-end"
                        onClick={() => self.navigateToTab('tab-order', {
                          mode: "issued",
                          orderLines: unavailable.map(u => JSON.parse(JSON.stringify(u.orderLine)))
                        })}>
              {self.orderMissingString}
              <ion-icon slot="end" name="checkmark-circle"></ion-icon>
            </ion-button>
          </ion-item-divider>
        )
      }
      const output = [getHeader()];
      unavailable.forEach(u => output.push(self.genLine(u.orderLine, u.stock ? u.stock.getQuantity() : 0)));
      return output;
    }

    function getAvailable(){
      const available = self.result.filter(r => r.stock && r.orderLine.quantity <= r.stock.getQuantity() && !r.orderLine.confirmed);
      if (!available.length)
        return [];
      const getHeader = function(){
        return (
          <ion-item-divider class="ion-margin-bottom">
            {self.availableString}
            <ion-button color="success" slot="end" fill="clear" size="small" class="ion-float-end" onClick={() => self.markAllAsConfirmed()}>
              {self.confirmAllString}
              <ion-icon slot="end" name="checkmark-circle"></ion-icon>
            </ion-button>
          </ion-item-divider>
        )
      }
      const output = [getHeader()];
      available.forEach(u => output.push(self.genLine(u.orderLine, u.stock ? u.stock.getQuantity() : 0)));
      return output;
    }

    function getConfirmed(){
      const confirmed = self.result.filter(r => !!r.orderLine.confirmed);
      if (!confirmed.length)
        return [];
      const getHeader = function(){
        return (
          <ion-item-divider class="ion-margin-bottom">
            {self.confirmedString}
            <ion-button color="danger" slot="end" fill="clear" size="small" class="ion-float-end" onClick={() => self.markAllAsConfirmed(false)}>
              {self.resetAllString}
              <ion-icon slot="end" name="close-circle"></ion-icon>
            </ion-button>
          </ion-item-divider>
        )
      }
      const output = [getHeader()];
      confirmed.forEach(u => output.push(self.genLine(u.orderLine, u.stock ? u.stock.getQuantity() : 0)));
      return output;
    }

    return [...getUnavailable(), ...getAvailable(), ...getConfirmed()];
  }

  getSimpleOrderLines(){
    const self  = this;
    if (!self.lines)
      return [];
    return (
      <pdm-item-organizer component-name="managed-orderline-stock-chip"
                          component-props={JSON.stringify(self.lines.map(u => {
                            const ul = u.orderLine || u;
                            return {
                              "gtin": ul.gtin,
                              "quantity": ul.quantity,
                              "mode": "detail",
                              "button": self.enableActions ? "cancel" : undefined,
                              "loader-type": SUPPORTED_LOADERS.bubblingSmall
                          }
                          }))}
                          id-prop="gtin"
                          is-ion-item="false"
                          single-line="false"
                          orientation="evenly"
                          display-count="25"
                          onSelectEvent={(evt) => {
                            evt.preventDefault();
                            evt.stopImmediatePropagation();
                            self.selectLine(evt.detail);
                          }}></pdm-item-organizer>
    )
  }

  getMainHeader(){
    return (
      <ion-item-divider class={this.showStock ? "" : "ion-margin-bottom"}>
        {this.linesString}
      </ion-item-divider>
    )
  }

  isReady(){
    return typeof this.lines !== 'string'
  }

  private getContent(){
    const content = [<ion-col size={this.showStock ? "6" : "12"}>
      {this.showStock ? this.getOrderLines() : this.getSimpleOrderLines()}
    </ion-col>];
    if (this.showStock)
      content.push(<ion-col size="6">
        {...this.getAvailableStock()}
      </ion-col>)
    return content;
  }

  render() {
    if (!this.host.isConnected)
      return;
    return (
      <Host>
        <ion-grid>
          <ion-row>
            {this.getMainHeader()}
          </ion-row>
          <ion-row>
            {
              !this.isReady() ? this.getLoading('circles') : this.getContent()
            }
          </ion-row>
        </ion-grid>
      </Host>
    );
  }
}

import {Component, Host, h, Element, Event, EventEmitter, Prop, State, Watch, Method, Listen} from '@stencil/core';
import {HostElement} from "../../decorators";
import wizard from '../../services/WizardService';
import {WebManager, WebManagerService} from "../../services/WebManagerService";
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
import CreateManageView from "../create-manage-view-layout/CreateManageView";

const ORDER_TYPE = {
  ISSUED: "issued",
  RECEIVED: 'received'
}

const ItemClasses = {
  selected: "selected",
  unnecessary: 'unnecessary',
  normal: 'normal',
  finished: 'finished'
}

const {Order, OrderLine, ROLE, Stock, Batch} = wizard.Model;
const MANAGED_ISSUED_ORDER_CUSTOM_EL_NAME = "managed-issued-order-popover";

@Component({
  tag: 'managed-order',
  styleUrl: 'managed-order.css',
  shadow: false,
})
export class ManagedOrder implements CreateManageView{

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

  /**
   * Through this event action requests are made
   */
  @Event({
    eventName: 'ssapp-action',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendCreateAction: EventEmitter;

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

  @Prop({attribute: "order-ref", mutable: true}) orderRef?: string;
  @Prop({attribute: 'order-lines', mutable: true}) orderLines;
  @Prop({attribute: 'requester', mutable: true}) requester;

  @Prop({attribute: 'order-type', mutable: true}) orderType: string = ORDER_TYPE.ISSUED;

  // strings
  @Prop({attribute: "create-title-string"}) titleString: string = "Title String"
  @Prop({attribute: "manage-title-string"}) manageString: string = "Manage String"
  @Prop({attribute: "back-string"}) backString: string = "Back to Products"
  @Prop({attribute: "scanner-title-string"}) scanString: string = "Please Scan your Product"

  @Prop({attribute: "create-string"}) createString:string = "Issue Order";
  @Prop({attribute: "clear-string"}) clearString: string = "Clear"

  @Prop({attribute: 'details-string', mutable: true}) detailsString: string = 'Details:';
  @Prop({attribute: 'from-string', mutable: true}) fromString: string = 'Order from:';
  @Prop({attribute: 'from-placeholder-string', mutable: true}) fromPlaceholderString: string = 'Select a supplier...';
  @Prop({attribute: 'from-at-string', mutable: true}) fromAtString: string = 'At:';
  @Prop({attribute: 'to-at-string', mutable: true}) toAtString: string = 'from:';
  @Prop({attribute: 'products-string', mutable: true}) productsString: string = 'Products:';
  @Prop({attribute: 'products-code-string', mutable: true}) productsCodeString: string = 'Product Code:';
  @Prop({attribute: 'quantity-string', mutable: true}) quantityString: string = 'Quantity:';
  @Prop({attribute: 'order-lines-string', mutable: true}) orderLinesString: string = 'OrderLines:';
  @Prop({attribute: 'directory-string', mutable: true}) directoryString: string = 'Directory:';

  private directoryManager: WebManager = undefined;
  private issuedOrderManager: WebManager = undefined;
  private receivedOrderManager: WebManager = undefined;
  private stockManager: WebManager = undefined;

  // for new Orders
  @State() senderId?: string = undefined;
  @State() senderAddress?: string = undefined;
  @State() suppliers?: string[] = undefined;
  @State() products?: string[] = undefined;
  @State() currentGtin?: string = undefined;
  @State() currentQuantity: number = 0;

  // for existing ones
  @Prop({attribute: 'stock-string'}) stockString: string = 'Stock:';
  @Prop({attribute: 'no-stock-string'}) noStockString: string = 'Empty';
  @Prop({attribute: 'select-product'}) selectProductString: string = 'Please Select a Product...';
  @Prop({attribute: 'remaining-string'}) remainingString: string = 'Remaining:';
  @Prop({attribute: 'reject-string'}) rejectString: string = 'Reject';

  @Prop({attribute: 'reset-all-string'}) resetAllString: string = 'Reset All';
  @Prop({attribute: 'proceed-string'}) proceedString: string = 'Continue:';
  @Prop({attribute: 'delay-string'}) delayString: string = 'Delay:';
  @Prop({attribute: 'confirmed-string'}) confirmedString: string = 'Confirmed:';
  @Prop({attribute: 'confirm-all-string'}) confirmAllString: string = 'Confirm All';
  @Prop({attribute: 'order-string'}) orderString: string = 'Order';
  @Prop({attribute: 'available-string'}) availableString: string = 'Available:';
  @Prop({attribute: 'unavailable-string'}) unavailableString: string = 'Unavailable:';

  @State() order?: typeof Order = undefined;
  private result: any = [];
  @State() stockForProduct = undefined;
  @State() selectedProduct: number = undefined;
  private shipmentLines = {};

  private layoutComponent = undefined;

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
    this.directoryManager = await WebManagerService.getWebManager('DirectoryManager');
    // const prefix = this.orderType.charAt(0).toUpperCase() + this.orderType.slice(1).toLowerCase();
    this.issuedOrderManager = await WebManagerService.getWebManager(`IssuedOrderManager`);
    this.receivedOrderManager = await WebManagerService.getWebManager(`ReceivedOrderManager`);
    this.stockManager = await WebManagerService.getWebManager("StockManager");
    return await this.load();
  }

  private getManager(){
    return this.isCreate() || this.orderType === ORDER_TYPE.ISSUED ? this.issuedOrderManager : this.receivedOrderManager;
  }

  async load(){
    let self = this;

    if (this.isCreate()){
      this.orderRef = undefined;
      return;
    }

    await self.getManager().getOne(this.orderRef, true, async (err, order) => {
      if (err)
        return this.sendError(`Could not retrieve order ${self.orderRef}`);
      self.order = order;
      self.loadOrderLinesAsync();
    });
  }

  private loadOrderLinesAsync(){
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

  async componentDidRender(){
    this.layoutComponent = this.layoutComponent || this.element.querySelector(`create-manage-view-layout`);
  }

  @Method()
  async updateDirectory(){
    this.getDirectoryProductsAsync();
    this.getSuppliersAsync();
  }

  private getDirectoryProductsAsync(){
    const self = this;
    const options = {
      query: [`role == ${ROLE.PRODUCT}`]
    }
    this.directoryManager.getAll(false, options, (err, gtins) => {
      if (err)
        return self.sendError(`Could not get directory listing for ${ROLE.PRODUCT}`, err);
      self.products = gtins;
    });
  }

  private getSuppliersAsync(callback?){

    const self = this;
    if (!self.directoryManager)
      return [];

    const options = {
      query: [`role like /${ROLE.MAH}|${ROLE.WHS}/g`]
    }

    self.directoryManager.getAll(false, options, (err, records) => {
      if (err){
        self.sendError(`Could not list Suppliers from directory`, err);
        return callback(err);
      }

      self.suppliers = records;
      if (callback)
        callback(undefined, records);
    });
  }

  @Watch('selectedProduct')
  async selectProduct(newGtin, oldGtin){
    if (!newGtin || oldGtin === newGtin)
      return;
    if (!!this.result.filter(r => r.orderLine.gtin === newGtin)[0].confirmed)
      return;
    this.stockForProduct = {...this.updateStock(newGtin)};
  }

  @Method()
  async selectOrderLine(gtin){
    this.selectedProduct = gtin;
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

    const result = productStock[0].stock ? productStock[0].stock.batches.sort((b1, b2) => {
      const date1 = new Date(b1.expiry).getTime();
      const date2 = new Date(b2.expiry).getTime();
      return date1 - date2;
    }) : [];

    self.shipmentLines[gtin] = self.splitStockByQuantity(result, gtin);
    return self.shipmentLines[gtin];
  }

  private splitStockByQuantity(stock: any, gtin){
    const self = this;
    let accum = 0;
    const result = {
      selected: [],
      divided: undefined,
      remaining: []
    };
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
        {!!this.stockForProduct.divided ? getBatch(this.stockForProduct.divided, ItemClasses.unnecessary) : ''}
        {...this.stockForProduct.remaining.map(r => getBatch(r, ItemClasses.normal))}
      </ion-reorder-group>
    )
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
      const unavailable = self.result.filter(r => (!r.stock || r.orderLine.quantity > r.stock.getQuantity()) && !r.orderLine.confirmed);
      if (!unavailable.length)
        return [];
      const getHeader = function(){
        return (
          <ion-item-divider>
            {self.unavailableString}
            <ion-button color="primary" slot="end" fill="solid" size="small" class="ion-float-end"
                        onClick={() => self.navigateToTab('tab-issued-order', unavailable.map(u => u.orderLine))}>
              {self.orderString}
              <ion-icon slot="end" name="checkmark-circle"></ion-icon>
            </ion-button>
          </ion-item-divider>
        )
      }
      const output = [getHeader()];
      unavailable.forEach(u => output.push(genOrderLine(u.orderLine, u.stock ? u.stock.getQuantity() : 0)));
      return output;
    }

    function getAvailable(){
      const available = self.result.filter(r => r.stock && r.orderLine.quantity <= r.stock.getQuantity() && !r.orderLine.confirmed);
      if (!available.length)
        return [];
      const getHeader = function(){
        return (
          <ion-item-divider>
            {self.availableString}
            <ion-button color="success" slot="end" fill="clear" size="small" class="ion-float-end" onClick={() => self.markAllAsConfirmed()}>
              {self.confirmAllString}
              <ion-icon slot="end" name="checkmark-circle"></ion-icon>
            </ion-button>
          </ion-item-divider>
        )
      }
      const output = [getHeader()];
      available.forEach(u => output.push(genOrderLine(u.orderLine, u.stock ? u.stock.getQuantity() : 0)));
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
              {self.resetAllString}
              <ion-icon slot="end" name="close-circle"></ion-icon>
            </ion-button>
          </ion-item-divider>
        )
      }
      const output = [getHeader()];
      confirmed.forEach(u => output.push(genOrderLine(u.orderLine, u.stock ? u.stock.getQuantity() : 0)));
      return output;
    }

    return [...getUnavailable(), ...getAvailable(), ...getConfirmed()];
  }

  async cancelOrderLine(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const {data} = evt.detail;

    if (data.gtin){
      const {gtin} = data;

      if (!this.orderLines)
        return;
      let index;
      this.orderLines.every((ol, i) => {
        if (ol.gtin !== gtin)
          return true;
        index = i;
        return false;
      });
      if (index === undefined)
        return;
      this.orderLines.splice(index,1);
      this.orderLines = [... this.orderLines];
    }
  }

  private definePopOverContent(){
    const self = this;

    if (!!customElements.get(MANAGED_ISSUED_ORDER_CUSTOM_EL_NAME))
      return;

    customElements.define(MANAGED_ISSUED_ORDER_CUSTOM_EL_NAME, class extends HTMLElement{
      connectedCallback(){
        const contentEl = this;
        const getDirectoryContent = function() {
          if (!self.products)
            return `<multi-spinner type="${SUPPORTED_LOADERS.circles}"></multi-spinner>`;
          const getProductElement = function (gtin) {
            return `<simple-managed-product-item gtin=${gtin}></simple-managed-product-item>`
          }
          return self.products.map(gtin => getProductElement(gtin)).join(`\n`);
        }
        this.innerHTML = `
<ion-content>
  <ion-list>
    ${getDirectoryContent()}
  </ion-list>
</ion-content>`;

        this.querySelectorAll('simple-managed-product-item').forEach(item => {
          item.addEventListener('click', () => {
            contentEl.closest('ion-popover').dismiss(undefined, item.getAttribute('gtin'));
          });
        });
      }
    });
  }

  private async getProductPopOver(evt){
    this.definePopOverContent();
    const popover = Object.assign(document.createElement('ion-popover'), {
      component: MANAGED_ISSUED_ORDER_CUSTOM_EL_NAME,
      cssClass: 'menu-tab-button-popover',
      translucent: true,
      event: evt,
      showBackdrop: false,
      animated: true,
      backdropDismiss: true,
    });
    document.body.appendChild(popover);
    await popover.present();

    const {role} = await popover.onWillDismiss();
    if (role && role !== 'backdrop')
      this.currentGtin = role;
  }

  private getLoading(type: string = SUPPORTED_LOADERS.simple){
    return (<multi-loader type={type}></multi-loader>);
  }

  @Listen('ionChange')
  onProductInputChange(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const {target} = evt;
    const {name, value} = target;
    console.log(evt, target, name, value);
    if (name === 'input-quantity')
      this.currentQuantity = value;
    if (name === 'input-senderId')
      this.senderId = value;
  }

  @Watch('orderRef')
  @Method()
  async refresh(){
    await this.load();
  }

  navigateBack(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.navigateToTab(`tab-${this.orderType}-orders`, {});
  }

  create(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.sendCreateAction.emit(new Order(undefined, this.requester.id, evt.detail.senderId, this.requester.address, undefined, this.orderLines.slice()));
  }

  isCreate(){
    return !this.orderRef || this.orderRef.startsWith('@');
  }

  private scan(){
    const self = this;
    const controller = self.element.querySelector('pdm-barcode-scanner-controller');
    if (!controller)
      return console.log(`Could not find scan controller`);
    controller.present((err, scanData) => {
      if (err)
        return self.sendError(`Could not scan`, err);
      console.log(scanData);
      self.currentGtin = scanData ? scanData.gtin || scanData.productCode || scanData.result: undefined;
    });
  }

  private addOrderLine(gtin, quantity){
    const updated = [];
    if (Array.isArray(this.orderLines))
      updated.push(...this.orderLines);
    const existing = updated.filter(u => u.gtin === gtin);
    if (existing.length){
      existing[0].quantity += quantity;
      this.orderLines = [...updated];
    } else {
      const ol = new OrderLine(gtin, quantity, this.requester.id, this.senderId);
      this.orderLines = [...updated, ol];
    }

    this.currentGtin = undefined;
    this.currentQuantity = 0;
  }

  getCreate(){
    const self = this;
    const isCreate = self.isCreate();

    const getSender = function(){
      const options = {
        cssClass: 'product-select'
      };

      const getFrom = function(){
        const result = [];
        if (self.suppliers){
          result.push(
            <ion-select name="input-senderId" interface="popover" interfaceOptions={options}
                        class="supplier-select" placeholder={self.fromPlaceholderString}
                        disabled={!isCreate} value={!isCreate ? self.senderId : ''}>
              {...self.suppliers.map(s => (<ion-select-option value={s}>{s}</ion-select-option>))}
            </ion-select>
          )
        } else {
          result.push(self.getLoading(SUPPORTED_LOADERS.bubblingSmall));
        }

        return result;
      }

      return (
        <ion-item lines="none" disabled={false}>
          <ion-label position="stacked">{self.fromString}</ion-label>
          {...getFrom()}
        </ion-item>
      )
    }

    const getRequesterLocale = function(){
      const getAddress = function(){
        if (!self.order)
          return (<ion-skeleton-text animated></ion-skeleton-text>)
        return (<ion-input disabled={true} value={self.order.shipToAddress}></ion-input>);
      }
      return (
        <ion-item lines="none" >
          <ion-label position="stacked">{self.orderType === ORDER_TYPE.ISSUED ? self.fromAtString : self.toAtString}</ion-label>
          {getAddress()}
        </ion-item>
      )
    }

    const getStatus = function(){
      const getBadge = function(){
        if (!self.order)
          return (<ion-skeleton-text animated></ion-skeleton-text>)
        return (<ion-badge class="ion-padding-horizontal">{self.order.status}</ion-badge>)
      }
      return (
        <ion-item lines="none">
          <ion-label position="stacked">{self.fromAtString}</ion-label>
          {getBadge()}
        </ion-item>
      )
    }

    const getProductInput = function(){
      return (
        <ion-item lines="none">
          <ion-label position="stacked">{self.productsCodeString}</ion-label>
          <ion-input name="input-gtin" type="number" value={self.currentGtin}></ion-input>
          <ion-buttons slot="end">
            <ion-button onClick={() => self.scan()} color="medium" size="large" fill="clear">
              <ion-icon slot="icon-only" name="scan-circle"></ion-icon>
            </ion-button>
            <ion-button onClick={(evt) => self.getProductPopOver(evt)} color="secondary" size="large" fill="clear">
              <ion-icon slot="icon-only" name="add-circle"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-item>
      )
    }

    const getQuantityInput = function(){
      return (
        <ion-item lines="none">
          <ion-label position="stacked">{self.quantityString}</ion-label>
          <ion-grid>
            <ion-row>
              <ion-col size="10">
                <ion-range name="input-quantity" min={0} max={Math.max(self.currentQuantity || 0, 100)}
                           pin={true} value={self.currentQuantity || 0} color="secondary">
                  <ion-button slot="start" fill="clear" color="secondary"
                              onClick={() => self.currentQuantity--}>
                    <ion-icon color="secondary" slot="icon-only" name="remove-circle"></ion-icon>
                  </ion-button>
                  <ion-button slot="end" fill="clear" color="secondary"
                              onClick={() => self.currentQuantity++}>
                    <ion-icon slot="icon-only" name="add-circle"></ion-icon>
                  </ion-button>
                </ion-range>
              </ion-col>
              <ion-col size="2" class="ion-padding-left">
                <ion-input name="input-quantity" type="number" value={self.currentQuantity || 0}></ion-input>
              </ion-col>
            </ion-row>
          </ion-grid>
          <ion-button slot="end" size="large" fill="clear" color="success"
                      disabled={!self.currentGtin || !self.currentQuantity} onClick={() => self.addOrderLine(self.currentGtin, self.currentQuantity)}>
            <ion-icon slot="icon-only" name="add-circle"></ion-icon>
          </ion-button>
        </ion-item>
      )
    }

    if (isCreate)
      return [
        getSender(),
        getProductInput(),
        getQuantityInput()
      ]

    return [
      getSender(),
      getRequesterLocale(),
      getStatus()
    ]
  }

  getPostCreate(){
    if (this.isCreate())
      return;
    return this.getCreate();
  }

  private getOrderLinesForCreate(){
    const self = this;
    if (!self.orderLines || !self.orderLines.length || typeof self.orderLines === 'string')
      return [];

    const genOrderLine = function(o){
      return (<managed-orderline-stock-chip onSendAction={(evt) => self.cancelOrderLine(evt)} gtin={o.gtin} quantity={o.quantity} available={10 * o.quantity} mode="detail" button="cancel"></managed-orderline-stock-chip>)
    }

    return self.orderLines.map(o => genOrderLine(o));
  }

  render() {
    if (!this.host.isConnected)
      return;
    return (
      <Host>
        <create-manage-view-layout create-title-string={this.titleString}
                                   manage-title-string={this.manageString}
                                   back-string={this.backString}
                                   create-string={this.createString}
                                   clear-string={this.clearString}
                                   icon-name="layers"
                                   is-create={this.isCreate()}
                                   onGoBackEvent={(evt) => this.navigateBack(evt)}
                                   onCreateEvent={(evt) => this.create(evt)}>
          <div slot="create">
            {...this.getCreate()}
            {...this.getOrderLinesForCreate()}
          </div>
          <div slot="postcreate">
            {...this.getPostCreate()}
          </div>
          <div slot="manage">
            {...this.getManage()}
          </div>
          <div slot="view"></div>
        </create-manage-view-layout>
        <pdm-barcode-scanner-controller barcode-title={this.scanString}></pdm-barcode-scanner-controller>
      </Host>
    );
  }

  getManage() {
    switch(this.orderType){
      case ORDER_TYPE.ISSUED:
        return this.getOrderLines();
      case ORDER_TYPE.RECEIVED:
        return (
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
        )
    }
  }

  getView() {
  }
}

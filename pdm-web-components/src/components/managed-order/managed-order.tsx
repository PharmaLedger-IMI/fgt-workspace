import {Component, Host, h, Element, Event, EventEmitter, Prop, State, Watch, Method, Listen} from '@stencil/core';
import {HostElement} from "../../decorators";
import wizard from '../../services/WizardService';
import {WebManager, WebManagerService} from "../../services/WebManagerService";
import CreateManageView from "../create-manage-view-layout/CreateManageView";
import {getProductPopOver, getDirectoryProducts, getDirectorySuppliers} from "../../utils/popOverUtils";

const ORDER_TYPE = {
  ISSUED: "issued",
  RECEIVED: 'received'
}

const {Order, OrderLine, ROLE} = wizard.Model;

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
      console.log(`Tab Navigation request seems to have been ignored by all components...`);
  }

  @Prop({attribute: "order-ref", mutable: true}) orderRef?: string;
  @Prop({attribute: 'order-lines-json', mutable: true}) orderLines: string;
  @Prop({attribute: 'identity', mutable: true}) identity;

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

  // Displays
  @Prop({attribute: 'status-string', mutable: true}) statusString: string = 'Shipment Status:';

  // Stock Management
  @Prop({attribute: 'stock-string'}) stockString: string = 'Stock:';
  @Prop({attribute: 'no-stock-string'}) noStockString: string = 'Empty';
  @Prop({attribute: 'reset-all-string'}) resetAllString: string = 'Reset All';
  @Prop({attribute: 'confirmed-string'}) confirmedString: string = 'Confirmed:';
  @Prop({attribute: 'confirm-all-string'}) confirmAllString: string = 'Confirm All';
  @Prop({attribute: 'available-string'}) availableString: string = 'Available:';
  @Prop({attribute: 'unavailable-string'}) unavailableString: string = 'Unavailable:';
  @Prop({attribute: 'select-string'}) selectString: string = 'Please Select an item...';
  @Prop({attribute: 'remaining-string'}) remainingString: string = 'Remaining:';
  @Prop({attribute: 'order-missing-string'}) orderMissingString: string = 'Order Missing';

  // Directory Variables
  private directoryManager: WebManager = undefined;
  @State() suppliers?: string[] = undefined;
  @State() products?: string[] = undefined;

  private issuedOrderManager: WebManager = undefined;
  private receivedOrderManager: WebManager = undefined;

  @State() lines = undefined;

  // for new Orders
  @State() participantId?: string = undefined;
  @State() senderAddress?: string = undefined;

  @State() currentGtin?: string = undefined;
  @State() currentQuantity: number = 0;

  // for existing ones
  @Prop({attribute: 'reject-string'}) rejectString: string = 'Reject';

  @Prop({attribute: 'proceed-string'}) proceedString: string = 'Continue:';
  @Prop({attribute: 'delay-string'}) delayString: string = 'Delay:';

  @State() order?: typeof Order = undefined;
  @State() stockForProduct = undefined;
  @State() selectedProduct: number = undefined;

  private layoutComponent = undefined;

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
    this.directoryManager = await WebManagerService.getWebManager('DirectoryManager');
    this.issuedOrderManager = await WebManagerService.getWebManager(`IssuedOrderManager`);
    this.receivedOrderManager = await WebManagerService.getWebManager(`ReceivedOrderManager`);
    return await this.load();
  }

  private getManager(){
    return this.isCreate() || this.getType() === ORDER_TYPE.ISSUED ? this.issuedOrderManager : this.receivedOrderManager;
  }

  private getType(){
    return this.orderType && !this.orderType.startsWith('@') ? this.orderType : ORDER_TYPE.ISSUED;
  }

  async load(){
    let self = this;

    if (this.isCreate())
      return this.reset()

    await self.getManager().getOne(this.orderRef, true, async (err, order) => {
      if (err)
        return this.sendError(`Could not retrieve order ${self.orderRef}`);
      self.order = order;
      self.participantId = this.getType() === ORDER_TYPE.ISSUED ? order.senderId : order.requesterId
      self.lines = [...order.orderLines];
    });
  }

  async componentDidRender(){
    this.layoutComponent = this.layoutComponent || this.element.querySelector(`create-manage-view-layout`);
  }

  @Method()
  async updateDirectory(){
    const self = this;

    const getDirectoryProductsAsync = function(){
      getDirectoryProducts(self.directoryManager, (err, gtins) => {
        if (err)
          return self.sendError(`Could not get directory listing for ${ROLE.PRODUCT}`, err);
        self.products = gtins;
      });
    }

    const getDirectorySuppliersAsync = function(){
      getDirectorySuppliers(self.directoryManager, (err, records) => {
        if (err)
          return self.sendError(`Could not list Suppliers from directory`, err);
        self.suppliers = records;
      });
    }

    getDirectoryProductsAsync();
    getDirectorySuppliersAsync();
  }

  @Listen('ionChange')
  onInputChange(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const {target} = evt;
    const {name, value} = target;
    if (name === 'input-quantity')
      this.currentQuantity = value;
    if (name === 'input-senderId')
      this.participantId = value;
  }

  @Watch('orderRef')
  @Method()
  async refresh(){
    await this.load();
  }

  @Watch('orderLines')
  async updateLines(newVal){
    if (newVal.startsWith('@'))
      return;
    this.lines = JSON.parse(newVal).map(o => new OrderLine(o.gtin, o.quantity, o.requesterId, o.senderId));
  }

  @Method()
  async reset(){
    if (this.isCreate() && this.lines && this.orderLines !== "[]"){
      this.order = undefined;
    } else {
      this.order = undefined;
      this.lines = [];
      const stockEl = this.getStockManagerEl();
      if (stockEl)
        stockEl.reset();
    }
  }

  private getStockManagerEl(){
    return this.element.querySelector('line-stock-manager');
  }

  navigateBack(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.navigateToTab(`tab-${this.getType()}-orders`, {});
  }

  create(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.sendCreateAction.emit(new Order(undefined, this.identity.id,
      evt.detail.senderId, this.identity.address, undefined,
      this.lines.slice()));
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
    this.lines = [...this.lines, new OrderLine(gtin, quantity, this.identity.id, this.participantId)]
    this.currentGtin = undefined;
    this.currentQuantity = 0;
  }

  private selectOrderLine(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.currentGtin = evt.detail;
  }

  private async showProductPopOver(evt){
    const popover = await getProductPopOver(evt, this.products);
    const {role} = await popover.onWillDismiss();
    if (role && role !== 'backdrop')
      this.currentGtin = role;
  }

  getInputs(){
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
                        disabled={!isCreate} value={!isCreate ? self.participantId : ''}>
              {...self.suppliers.map(s => (<ion-select-option value={s}>{s}</ion-select-option>))}
            </ion-select>
          )
        } else {
          result.push(<ion-skeleton-text animated></ion-skeleton-text>);
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
          <ion-label position="stacked">{self.getType() === ORDER_TYPE.ISSUED ? self.fromAtString : self.toAtString}</ion-label>
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
          <ion-label position="stacked">{self.statusString}</ion-label>
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
            <ion-button onClick={(evt) => self.showProductPopOver(evt)} color="secondary" size="large" fill="clear">
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

  getCreate(){
    if (!this.isCreate())
      return [];
    return [
      ...this.getInputs(),
      <line-stock-manager lines={this.lines}
                          show-stock={false}
                          enable-actions={true}

                          onSelectEvent={(evt) => this.selectOrderLine(evt)}

                          lines-string={this.orderLinesString}
                          stock-string={this.stockString}
                          no-stock-string={this.noStockString}
                          select-string={this.selectString}
                          remaining-string={this.remainingString}
                          order-missing-string={this.orderMissingString}
                          available-string={this.availableString}
                          unavailable-string={this.unavailableString}
                          confirmed-string={this.confirmedString}
                          confirm-all-string={this.confirmAllString}
                          reset-all-string={this.resetAllString}>
      </line-stock-manager>
    ]
  }

  getPostCreate(){
    if (this.isCreate())
      return [];
    return this.getInputs();
  }

  getManage() {
    if (this.isCreate())
      return;
    return (
      <line-stock-manager lines={this.lines}
                          show-stock={this.isCreate()}
                          enable-action={this.getType() === ORDER_TYPE.RECEIVED || this.isCreate()}

                          stock-string={this.stockString}
                          no-stock-string={this.noStockString}
                          select-string={this.selectString}
                          remaining-string={this.remainingString}
                          order-missing-string={this.orderMissingString}
                          available-string={this.availableString}
                          unavailable-string={this.unavailableString}
                          confirmed-string={this.confirmedString}
                          confirm-all-string={this.confirmAllString}
                          reset-all-string={this.resetAllString}>
      </line-stock-manager>
    )
  }

  getView() {
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
          </div>
          <div slot="postcreate">
            {...this.getPostCreate()}
          </div>
          <div slot="manage">
            {this.getManage()}
          </div>
          <div slot="view">
            {this.getView()}
          </div>
        </create-manage-view-layout>
        <pdm-barcode-scanner-controller barcode-title={this.scanString}></pdm-barcode-scanner-controller>
      </Host>
    );
  }
}
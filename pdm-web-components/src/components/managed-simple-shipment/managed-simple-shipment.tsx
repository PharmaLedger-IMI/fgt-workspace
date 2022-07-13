import {Component, Host, h, Element, Event, EventEmitter, Prop, State, Watch, Method, Listen} from '@stencil/core';
import {HostElement} from "../../decorators";
import wizard from '../../services/WizardService';
import {WebManager, WebManagerService} from "../../services/WebManagerService";
import CreateManageView from "../create-manage-view-layout/CreateManageView";
import {
  getProductPopOver,
  getGtinsInStock,
  getDirectoryRequesters,
  getSingleInputPopOver
} from "../../utils/popOverUtils";

const SHIPMENT_TYPE = {
  ISSUED: "issued",
  RECEIVED: 'received'
}

const {ROLE, ShipmentStatus, SimpleShipment, ShipmentLine} = wizard.Model;

@Component({
  tag: 'managed-simple-shipment',
  styleUrl: 'managed-simple-shipment.css',
  shadow: false,
})
export class ManagedSimpleShipment implements CreateManageView{

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
   * Through this event back navigation requests are made
   */
  @Event({
    eventName: 'ssapp-back-navigate',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendNavigateBack: EventEmitter;

  /**
   * Through this event action requests are made
   */
  @Event({
    eventName: 'ssapp-action',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendAction: EventEmitter;

  private sendError(message: string, err?: object){
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Product Component: ${message}`, err);
  }

  // Functional Props
  @Prop({attribute: "shipment-ref", mutable: true}) shipmentRef?: string;
  // @Prop({attribute: "order-json", mutable: true}) orderJSON?: string = undefined;
  @Prop({attribute: 'identity'}) identity;
  @Prop({attribute: 'shipment-type'}) shipmentType: string = SHIPMENT_TYPE.ISSUED;

  @Prop({attribute: 'statuses', mutable: true, reflect: true}) statuses: any;
  // strings

  // General
  @Prop({attribute: "create-title-string"}) titleString: string = "Title String"
  @Prop({attribute: "manage-title-string"}) manageString: string = "Manage String"
  @Prop({attribute: "back-string"}) backString: string = "Back"
  @Prop({attribute: "scanner-title-string"}) scanString: string = "Please Scan your Product"

  // Form Buttons
  @Prop({attribute: "create-string"}) createString:string = "Issue Shipment";
  @Prop({attribute: "clear-string"}) clearString: string = "Clear"

  // Input Strings
  @Prop({attribute: 'order-id-string', mutable: true}) orderIdString: string = 'Shipment Id:';
  @Prop({attribute: 'from-string', mutable: true}) fromString: string = 'Shipment from:';
  @Prop({attribute: 'to-string', mutable: true}) to_String: string = 'Shipment to:';
  @Prop({attribute: 'to-placeholder-string', mutable: true}) toPlaceholderString: string = 'Select a requester...';
  @Prop({attribute: 'from-at-string', mutable: true}) fromAtString: string = 'At:';
  @Prop({attribute: 'to-at-string', mutable: true}) toAtString: string = 'from:';
  @Prop({attribute: 'products-string', mutable: true}) productsString: string = 'Products:';
  @Prop({attribute: 'products-code-string', mutable: true}) productsCodeString: string = 'Product Code:';
  @Prop({attribute: 'quantity-string', mutable: true}) quantityString: string = 'Quantity:';

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
  @State() products?: string[] = undefined;
  @State() requesters?: string[] = undefined;
  @State() suppliers?: string[] = undefined;

  private issuedShipmentManager: WebManager = undefined;
  private receivedShipmentManager: WebManager = undefined;
  private productManager: WebManager = undefined;
  private stockManager: WebManager = undefined;

  private layoutComponent = undefined;

  // for new Shipments
  @State() participantId?: string = undefined;
  @State() shipment: typeof SimpleShipment = undefined;

  @State() lines = [];
  @State() currentGtin?: string = undefined;
  @State() currentQuantity: number = 0;

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
    this.directoryManager = await WebManagerService.getWebManager('DirectoryManager');
    this.productManager = await WebManagerService.getWebManager('ProductManager');
    this.stockManager = await WebManagerService.getWebManager('StockManager');
    this.issuedShipmentManager = await WebManagerService.getWebManager(`IssuedShipmentManager`);
    this.receivedShipmentManager = await WebManagerService.getWebManager(`ReceivedShipmentManager`);
    return await this.load();
  }

  private getManager(){
    return this.isCreate() || this.getType() === SHIPMENT_TYPE.ISSUED ? this.issuedShipmentManager : this.receivedShipmentManager;
  }

  private getType(){
    const self = this;
    const evalByShipmentType = () => {
      return self.shipmentType && !self.shipmentType.startsWith('@') ? self.shipmentType : SHIPMENT_TYPE.ISSUED;

    }
    if (!this.shipment || !this.identity)
      return evalByShipmentType();

    const identity = this.identity.id;
    if (this.shipment.senderId === identity)
      return SHIPMENT_TYPE.ISSUED;
    if (this.shipment.requesterId === identity)
      return SHIPMENT_TYPE.RECEIVED;
    throw new Error("should be impossible. identity not involved in shipment")
  }

  async load(){
    let self = this;

    if (this.isCreate())
      return this.reset();

    self.getManager().getOne(this.shipmentRef, true, async (err, shipment) => {
      if (err)
        return this.sendError(`Could not retrieve shipment ${self.shipmentRef}`);
      self.shipment = shipment;
      self.participantId = this.getType() === SHIPMENT_TYPE.ISSUED ? shipment.requesterId : shipment.senderId;
      self.lines = [...shipment.shipmentLines]
    });
  }

  async componentDidRender(){
    this.layoutComponent = this.layoutComponent || this.element.querySelector(`create-manage-view-layout`);
  }

  @Method()
  async updateDirectory(){
    const self = this;
    const getDirectoryProductsAsync = function(callback){
      if (self.identity && self.identity.id && self.identity.id.startsWith("MAH"))
        return self.productManager.getAll(false, undefined, (err, gtins) => {
          if (err)
            return callback(err);
          self.products = gtins;
          callback()
        })

      getGtinsInStock(self.stockManager, (err, gtins) => {
        if (err)
          return callback(err);
        self.products = gtins;
        callback()
      });
    }
    const getDirectoryRequestersAsync = function(callback){
      getDirectoryRequesters(self.directoryManager, (err, records) => {
        if (err)
          return callback(err);
        self.requesters = records;
        callback();
      });
    }

    return new Promise((resolve, reject) => {

      const showError = function(message, err){
        self.sendError(message, err);
        reject(err)
      }

      getDirectoryProductsAsync((err) => {
        if (err)
          return showError(`Could not get directory listing for ${ROLE.PRODUCT}`, err);
        getDirectoryRequestersAsync((err) => {
          if (err)
            return showError(`Could not list requesters from directory`, err);
          resolve("");
        })
      })
    })
  }

  private async showProductPopOver(evt){
    const popover = await getProductPopOver(evt, this.products);
    const {role} = await popover.onWillDismiss();
    if (role && role !== 'backdrop')
      this.currentGtin = role;
  }

  @Listen('ionChange')
  onInputChange(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const {target} = evt;
    const {name, value} = target;
    if (name === 'input-quantity')
      this.currentQuantity = value;
    if (this.getType() === SHIPMENT_TYPE.ISSUED && name === 'input-requesterId'
      || this.getType() === SHIPMENT_TYPE.RECEIVED && name === 'input-senderId')
      this.participantId = value;
  }

  @Watch('shipmentRef')
  @Method()
  async refresh(){
    await this.load();
  }

  @Watch('shipmentLines')
  async updateLines(newVal){
    if (newVal.startsWith('@'))
      return;
    this.lines = JSON.parse(newVal).map(o => new ShipmentLine({
      gtin: o.gtin,
      quantity: o.quantity,
      requesterId: o.requesterId,
      senderId: o.senderId
    }));
  }

  @Watch('statuses')
  async updateStatuses(newVal){
    if (typeof newVal === 'string')
      return;
    console.log(newVal);
  }

  @Method()
  async reset() {
    this.shipmentRef = '';
    this.shipment = undefined;
    const stockEl = this.getStockManagerEl();
    if (stockEl)
      stockEl.reset();
    this.lines = [];
  }

  private getStockManagerEl(){
    return this.element.querySelector('line-stock-manager');
  }

  navigateBack(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const event = this.sendNavigateBack.emit();
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored by all components...`);
  }

  async create(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.sendAction.emit({
      action: ShipmentStatus.CREATED,
      props:{
        shipment: new SimpleShipment({
          shipmentId: evt.detail.shipmentId,
          requesterId: evt.detail.requesterId,
          senderId: this.identity.id,
          shipFromAddress: this.identity.address,
          shipToAddress: evt.detail["requester-address"],
          shipmentLines: this.lines.slice()
        }),
        stock: await this.getStockManagerEl().getResult()
      }
    });
  }

  async update(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const { status, extraInfo } = evt.detail;
    this.sendAction.emit({
      action: evt.detail,
      props: {
        shipment: new SimpleShipment({
          shipmentId: this.shipment.shipmentId,
          requesterId: this.shipment.requesterId,
          senderId: this.shipment.senderId,
          shipToAddress: this.shipment.shipToAddress,
          status: this.shipment.status,
          shipmentLines: this.shipment.shipmentLines.slice()
        }),
        newStatus: status,
        extraInfo
      }
    });
  }

  isCreate(){
    return !this.shipmentRef || this.shipmentRef.startsWith('@');
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

  private addShipmentLine(gtin, quantity){
    this.lines = [...this.lines, new ShipmentLine({
      gtin: gtin,
      quantity: quantity,
      requestedId: this.participantId,
      senderId: this.identity.id
    })]
    this.currentGtin = undefined;
    this.currentQuantity = 0;
  }

  private async addToDirectory(evt, message, setter){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const popover = await getSingleInputPopOver(evt, message);
    const {role} = await popover.onWillDismiss();
    if (role && role !== 'backdrop')
      setter(role);
  }

  private selectShipmentLine(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.currentGtin = evt.detail;
  }

  private getInputs(){
    const self = this;
    const isCreate = self.isCreate();

    const options = {
      cssClass: 'select-popover-select'
    };

    const getShipmentRef = function(){
      const getInput = function () {
          return (
            <ion-input name="input-shipmentId" disabled={!!self.shipment}
                       value={self.shipment ? self.shipment.shipmentId : '-'}></ion-input>
          )
      };
      return (
        <ion-item lines="none" disabled={false}>
          <ion-label position="stacked">{self.orderIdString}</ion-label>
          {getInput()}
        </ion-item>
      )
    }

    const getSender = function() {
      const getFrom = function () {
        const result = [];
        const directory = self.getType() === SHIPMENT_TYPE.ISSUED ? isCreate ? self.suppliers : self.requesters : self.suppliers;
        if (self.getType() === SHIPMENT_TYPE.ISSUED && self.requesters && isCreate) {
          result.push(
              <ion-select name="input-senderId" interface="popover" interfaceOptions={options}
                          class="sender-select"
                          disabled={!isCreate} value={!isCreate ? self.participantId : ''}>
                {...directory.map(s => (<ion-select-option value={s}>{s}</ion-select-option>))}
              </ion-select>,
              <ion-button slot="end" color="medium" fill="clear" class="ion-padding-vertical" onClick={(evt) => self.addToDirectory.call(self, evt, "Please add a new SenderId",  (result) => {
                directory.push(result);
                const input = self.element.querySelector(`input[name="input-senderId"]`).closest('ion-select');
                if (input)
                  input.value = result;
                self.participantId = result;
              })}>
                <ion-icon slot="icon-only" name="add-circle"></ion-icon>
              </ion-button>
          )
        } else if (self.getType() === SHIPMENT_TYPE.RECEIVED) {
          result.push (
            <ion-input name="input-senderId" disabled={true} value={self.shipment ? self.shipment.senderId : self.identity.id}></ion-input>
          )
        } else {
          result.push(<ion-skeleton-text animated></ion-skeleton-text>);
        }

        return result;
      };

      return (
        <ion-item lines="none" disabled={false}>
          <ion-label position="stacked">{self.fromString}</ion-label>
          {...getFrom()}
        </ion-item>
      )
    }

    const getRequester = function(){
      const getTo = function(){
        const isDisabled = !isCreate;
        const result = [];
        if (self.getType() === SHIPMENT_TYPE.ISSUED && self.requesters) {
          const options = {
            cssClass: 'product-select'
          };
          result.push(
            <ion-select name="input-requesterId" interface="popover" interfaceOptions={options}
                        class="requester-select" disabled={isDisabled}
                        value={isCreate ? (self.shipment ? self.shipment.requesterId : self.participantId) : (self.shipment ? self.shipment.requesterId : self.participantId)}>
              {...self.requesters.map(s => (<ion-select-option value={s}>{s}</ion-select-option>))}
            </ion-select>
          )
          if (!isDisabled)
            result.push(
              <ion-button slot="start" color="medium" class="ion-padding-vertical" fill="clear" onClick={(evt) => self.addToDirectory.call(self, evt, "Please add a new RequesterId",  (result) => {
                self.requesters.push(result);
                const input = self.element.querySelector(`input[name="input-requesterId"]`).closest('ion-select');
                if (input)
                  input.value = result;
              })}>
                <ion-icon slot="icon-only" name="add-circle"></ion-icon>
              </ion-button>
            )
        } else if (self.getType() === SHIPMENT_TYPE.RECEIVED) {
          result.push(
            <ion-input name="input-requesterId" disabled={true} value={self.shipment.requesterId}></ion-input>
          )
        } else {
          result.push(<ion-skeleton-text animated></ion-skeleton-text>);
        }
        return result;
      };

      return (
          <ion-item lines="none" disabled={false}>
            <ion-label position="stacked">{self.to_String}</ion-label>
            {...getTo()}
          </ion-item>
        )
    }

    const getRequesterLocale = function(){
      const getAddress = function(){
        return (<ion-input name="input-requester-address" disabled={!!self.shipment} value={self.shipment ? self.shipment.shipToAddress : ""}></ion-input>);
      }
      return (
        <ion-item lines="none" >
          <ion-label position="stacked">{self.fromAtString}</ion-label>
          {getAddress()}
        </ion-item>
      )
    }

    const getSenderLocale = function(){
      const getAddress = function(){
        return (<ion-input name="input-sender-address" disabled={!!self.shipment} value={self.shipment ? self.shipment.shipFromAddress : self.identity.address}></ion-input>);
      }
      return (
        <ion-item lines="none" >
          <ion-label position="stacked">{self.toAtString}</ion-label>
          {getAddress()}
        </ion-item>
      )
    }

    const getStatus = function(){
      if (isCreate)
        return;
      const getBadge = function(){
        if (!self.shipment)
          return (<ion-skeleton-text animated></ion-skeleton-text>)
        return (<ion-badge class="ion-padding-horizontal">{self.shipment.status.status}</ion-badge>)
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
                      disabled={!self.currentGtin || !self.currentQuantity} onClick={() => self.addShipmentLine(self.currentGtin, self.currentQuantity)}>
            <ion-icon slot="icon-only" name="add-circle"></ion-icon>
          </ion-button>
        </ion-item>
      )
    }

    switch (self.getType()){
      case SHIPMENT_TYPE.ISSUED:
        const inputs =  [
          getShipmentRef(),
          getRequester(),
          getRequesterLocale()
        ]
        if (isCreate)
          inputs.push(getProductInput(), getQuantityInput());
        return inputs;
      case SHIPMENT_TYPE.RECEIVED:
        return [
          getShipmentRef(),
          getSender(),
          getSenderLocale(),
          getRequesterLocale(),
          getStatus()
        ]
    }
  }

  getCreate(){
    if (!this.isCreate())
      return;
    return [
      ...this.getInputs(),
      <line-stock-manager lines={this.lines}
                          show-stock={true}
                          enable-actions={true}

                          onSelectEvent={(evt) => this.selectShipmentLine(evt)}

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
    ];
  }

  getPostCreate(){
    if (this.isCreate())
      return;
    return this.getInputs();
  }

  getManage() {
    if (this.isCreate() || !this.shipment)
      return;
    const self = this;
    const getLines = function(){
      return (
        <line-stock-manager lines={self.lines}
                            show-stock="false"
                            enable-action="false"

                            stock-string={self.stockString}
                            no-stock-string={self.noStockString}
                            select-string={self.selectString}
                            remaining-string={self.remainingString}
                            order-missing-string={self.orderMissingString}
                            available-string={self.availableString}
                            unavailable-string={self.unavailableString}
                            confirmed-string={self.confirmedString}
                            confirm-all-string={self.confirmAllString}
                            reset-all-string={self.resetAllString}>
        </line-stock-manager>
      )
    }

    const getStatusUpdater = function(){
      return (
        <ion-grid>
          <ion-row>
            <ion-col size="12" size-lg="6">
              {getLines()}
            </ion-col>
            <ion-col size="12" size-lg="6">
              <status-updater state-json={JSON.stringify(self.statuses)}
                              current-state={JSON.stringify(self.shipment.status)}
                              onStatusUpdateEvent={self.update.bind(self)}>
              </status-updater>
            </ion-col>
          </ion-row>
        </ion-grid>
      )
    }

    if (self.getType() === SHIPMENT_TYPE.RECEIVED)
      return getStatusUpdater();
    if (self.getType() === SHIPMENT_TYPE.ISSUED)
      return getStatusUpdater();

    return getLines();
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
            {...(this.getCreate() || [])}
          </div>
          <div slot="postcreate">
            {...(this.getPostCreate() || [])}
          </div>
          <div slot="manage">
            {this.getManage()}
          </div>
          <div slot="view"></div>
        </create-manage-view-layout>
        <pdm-barcode-scanner-controller barcode-title={this.scanString}></pdm-barcode-scanner-controller>
      </Host>
    );
  }
}

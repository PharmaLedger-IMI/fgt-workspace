import {Component, Host, h, Element, Event, EventEmitter, Prop, State, Watch, Method} from '@stencil/core';
import {HostElement} from "../../decorators";
import wizard from '../../services/WizardService';
import {WebManager, WebManagerService} from "../../services/WebManagerService";
import {getBarCodePopOver} from "../../utils/popOverUtils";
import CreateManageView from "../create-manage-view-layout/CreateManageView";

const {IndividualProduct, utils} = wizard.Model;

@Component({
  tag: 'managed-individual-product',
  styleUrl: 'managed-individual-product.css',
  shadow: false,
})
export class ManagedIndividualProduct implements CreateManageView{

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

  private navigateToTab(tab: string,  props: any){
    const event = this.sendNavigateTab.emit({
      tab: tab,
      props: props
    });
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored byt all components...`);
  }

  @Prop({attribute: "individual-ref", mutable: true, reflect: true}) individualRef?: string = undefined;
  @Prop({attribute: 'statuses', mutable: true, reflect: true}) statuses: any;

  // strings
  @Prop({attribute: "title-string"}) manageString: string = "Manage String"
  @Prop({attribute: "back-string"}) backString: string = "Back to Products"
  @Prop({attribute: "product-name-string"}) nameString: string = "Product Name"
  @Prop({attribute: "gtin-string"}) gtinString: string = "Product Gtin"
  @Prop({attribute: "manuf-string"}) manufString: string = "Product Manufacturer Id"
  @Prop({attribute: "expiry-string"}) expiryString: string = "Product Expiry";
  @Prop({attribute: "serial-string"}) serialString: string = "SerialNumber";
  @Prop({attribute: "status-string"}) statusString: string = "Status";
  @Prop({attribute: "batch-string"}) batchString: string = "Batch";



  private stockManager: WebManager = undefined;
  private batchManager: WebManager = undefined;

  @State() individualProduct: typeof IndividualProduct = undefined;
  @State() manufName: string = undefined;
  @State() expiry: Date = undefined;
  @State() name: string = undefined;

  private layoutComponent = undefined;

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
    this.stockManager = await WebManagerService.getWebManager("StockManager");
    this.batchManager = await WebManagerService.getWebManager("BatchManager");
    await this.load();
  }

  async componentDidRender(){
    this.layoutComponent = this.layoutComponent || this.element.querySelector(`create-manage-view-layout`);
  }

  async load(){
    let self = this;
    if (!self.stockManager || !self.individualRef)
      return;

    const parseRef = function(){
      const ref = self.individualRef.split('-');
      return ref.length !== 3 ? undefined : {
        gtin: ref[0],
        batchNumber: ref[1],
        serialNumber: ref[2]
      }
    }

    const ref = parseRef();
    if (!ref)
      return self.sendError(`Invalid Individual Reference`);

    self.stockManager.getOne(ref.gtin, true, (err, stock) => {
      if (err)
        return self.sendError(`Could not find stock for gtin ${ref.gtin}`, err);
      self.name = stock.name;
      self.manufName = stock.manufName;

      const batch = stock.batches.find(b => b.batchNumber === ref.batchNumber);
      if (!batch)
        return self.sendError(`Could not find Batch ${ref.batchNumber} for gtin ${ref.gtin} in Stock`);
      self.batchManager.getOne(ref.gtin, ref.batchNumber, (err, batch) => {
        if (err)
          return self.sendError(`Could not Resolve Batch ${ref.batchNumber} for gtin ${ref.gtin}`);

        self.expiry = new Date(batch.expiry);

        const individualProduct = batch.getIndividualProduct(ref.gtin, ref.serialNumber);
        if (!individualProduct)
          return self.sendError(`Could not find Individual Product ${ref.serialNumber} in Batch ${ref.batchNumber} for gtin ${ref.gtin}. Should be impossible`);

        self.individualProduct = individualProduct;
      });
    });
  }

  @Watch('individualRef')
  @Method()
  async refresh(){
    await this.load();
  }

  @Watch('statuses')
  async updateStatuses(newVal){
    if (typeof newVal === 'string')
      return;
    console.log(newVal);
  }

  @Method()
  async reset(){

  }

  navigateBack(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const event = this.sendNavigateBack.emit();
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored by all components...`);
  }

  create(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    console.log(`this does nothing`)
    // this.sendCreateAction.emit(new Product(evt.detail));
  }

  async update(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.sendAction.emit({
      action: evt.detail,
      props:{
        individualProduct: this.individualProduct,
        newStatus: evt.detail
      }
    });
  }

  isCreate(){
    return false;
  }

  getInputs(){
    const self = this;

    const getBarCodeButton = function(){
      if (!self.individualProduct)
        return;

      const {gtin, batchNumber, expiry, serialNumber} = self.individualProduct;
      return (
        <ion-button size="large" color="medium" fill="clear" slot="end" onClick={(evt) => getBarCodePopOver({
          type: "gs1datamatrix",
          size: "32",
          scale: "6",
          data: utils.generate2DMatrixCode(gtin, batchNumber, expiry.getTime(), serialNumber)
        }, evt)}>
          <ion-icon slot="icon-only" name="barcode"></ion-icon>
        </ion-button>
      )
    }

    return [
      <ion-item class="ion-margin-vertical">
        <ion-label position="floating">{self.nameString}</ion-label>
        <ion-input name="input-name" disabled={true} value={self.name}></ion-input>
      </ion-item>,
      <ion-item class="ion-margin-bottom">
        <ion-label position="floating">{self.gtinString}</ion-label>
        <ion-input name="input-gtin" type="number" maxlength={14} minlength={14} disabled={true} value={self.individualProduct && self.individualProduct.gtin}></ion-input>
      </ion-item>,
      <ion-item class="ion-margin-bottom">
        <ion-label position="floating">{self.manufString}</ion-label>
        <ion-input name="input-manufName" disabled={true} value={self.manufName}></ion-input>
      </ion-item>,
      <ion-item class="ion-margin-bottom">
        <ion-label position="floating">{self.batchString}</ion-label>
        <ion-input name="input-manufName" disabled={true} value={self.individualProduct && self.individualProduct.batchNumber}></ion-input>
      </ion-item>,
      <ion-item className="ion-margin-bottom">
        <ion-label position="floating">{self.expiryString}</ion-label>
        <ion-input name="input-expiry" type="date" disabled="true" value={self.expiry}></ion-input>
      </ion-item>,
      <ion-item className="ion-margin-bottom">
        <ion-label position="floating">{self.serialString}</ion-label>
        <ion-badge color="secondary">{self.individualProduct && self.individualProduct.serialNumber}</ion-badge>
        {getBarCodeButton()}
      </ion-item>,
      <ion-item className="ion-margin-bottom">
        <ion-label position="floating">{self.statusString}</ion-label>
        <ion-badge color="tertiary">{self.individualProduct && self.individualProduct.status}</ion-badge>
      </ion-item>
    ]
  }

  getCreate(){
      return [];
  }

  getManage() {
    if (this.isCreate() || !this.individualProduct)
      return;
    const self = this;
    return (
      <status-updater state-json={JSON.stringify(self.statuses)}
                      current-state={self.individualProduct.status}
                      onStatusUpdateEvent={self.update.bind(self)}>
      </status-updater>
    )
  }

  getPostCreate(){
    if (this.isCreate())
      return [];
    return this.getInputs()
  }

  getView(){
  }

  render() {
    if (!this.host.isConnected)
      return;
    return (
      <Host>
        <create-manage-view-layout manage-title-string={this.manageString}
                                   back-string={this.backString}
                                   break-point="xl-6"
                                   icon-name="layers"
                                   is-create={false}
                                   onGoBackEvent={(evt) => this.navigateBack(evt)}>
          <div slot="create">
            {...this.getCreate()}
          </div>
          <div slot="postcreate">
            {...this.getPostCreate()}
          </div>
          <div slot="manage">
            {this.getManage()}
          </div>
          <div slot="view"></div>
        </create-manage-view-layout>
      </Host>
    );
  }
}

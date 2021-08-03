import {Component, Host, h, Element, Event, EventEmitter, Prop, State, Watch, Method} from '@stencil/core';
import {HostElement} from "../../decorators";
import wizard from '../../services/WizardService';
import {WebManager, WebManagerService} from "../../services/WebManagerService";
import {getBarCodePopOver} from "../../utils/popOverUtils";
import CreateManageView from "../create-manage-view-layout/CreateManageView";

const {generateGtin, generateProductName} = wizard.Model.utils;
const Product = wizard.Model.Product;

@Component({
  tag: 'managed-product',
  styleUrl: 'managed-product.css',
  shadow: false,
})
export class ManagedProduct implements CreateManageView{

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
  sendCreateAction: EventEmitter;

  private sendError(message: string, err?: object){
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Product Component: ${message}`, err);
  }

  private navigateToTab(){
    const event = this.sendNavigateBack.emit();
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored byt all components...`);
  }

  @Prop({attribute: "gtin", mutable: true, reflect: true}) gtin?: string = undefined;
  @Prop({attribute: "manuf-name", mutable: true}) manufName?: string = undefined;

  // strings
  @Prop({attribute: "create-title-string"}) titleString: string = "Title String"
  @Prop({attribute: "manage-title-string"}) manageString: string = "Manage String"
  @Prop({attribute: "back-string"}) backString: string = "Back to Products"
  @Prop({attribute: "product-name-string"}) nameString: string = "Product Name"
  @Prop({attribute: "gtin-string"}) gtinString: string = "Product Gtin"
  @Prop({attribute: "manuf-string"}) manufString: string = "Product Manufacturer Id"
  @Prop({attribute: "description-string"}) descriptionString: string = "Product Description";
  @Prop({attribute: "description-placeholder-string"}) descriptionPlaceholderString: string = "Enter any description here..."

  @Prop({attribute: "add-product-string"}) addProductString:string = "Add Product";
  @Prop({attribute: "clear-string"}) clearString: string = "Clear"

  @Prop({attribute: 'batches-title-string', mutable: true}) batchesTitle: string = "Batches for";
  @Prop({attribute: 'batches-add-button-string', mutable: true}) batchesAddButton: string = "Add Batch";

  private productManager: WebManager = undefined;

  @State() product: typeof Product = undefined;

  private layoutComponent = undefined;

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
    this.productManager = await WebManagerService.getWebManager("ProductManager");
    await this.load();
  }

  async componentDidRender(){
    this.layoutComponent = this.layoutComponent || this.element.querySelector(`create-manage-view-layout`);
  }

  async load(){
    let self = this;
    if (!self.productManager)
      return;

    if (this.isCreate()){
      this.product = undefined;
      return;
    }

    self.productManager.getOne(self.gtin, true, (err, product) => {
      if (err){
        self.sendError(`Could not get Product with gtin ${self.gtin}`, err);
        return;
      }
      this.product = product;
    });
  }

  @Watch('gtin')
  @Method()
  async refresh(){
    await this.load();
  }

  @Method()
  async reset(){

  }

  navigateBack(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    // this.navigateToTab('tab-products', {});
    this.navigateToTab();
  }

  create(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.sendCreateAction.emit(new Product(evt.detail));
  }

  private async setRandomGtin(){
    const el = await this.layoutComponent.getInput("gtin");
    el.setFocus();
    el.value = generateGtin();
  }

  private async setRandomName(){
    const el = await this.layoutComponent.getInput("name");
    el.setFocus();
    el.value = generateProductName();
  }

  isCreate(){
    return !this.gtin || this.gtin.startsWith('@');
  }

  getInputs(){
    const self = this;
    const isCreate = self.isCreate();

    const getRandomNameButton = function(){
      if (!isCreate)
        return;
      return (
        <ion-button size="large" fill="clear" slot="end" onClick={() => self.setRandomName.call(self)}>
          <ion-icon slot="icon-only" name="shuffle"></ion-icon>
        </ion-button>
      )
    }

    const getRandomGtinButton = function(){
      if (!isCreate)
        return;
      return (
        <ion-button size="large" fill="clear" slot="end" onClick={() => self.setRandomGtin()}>
          <ion-icon slot="icon-only" name="shuffle"></ion-icon>
        </ion-button>
      )
    }

    const getBarCodeButton = function(){
      if (isCreate)
        return;
      return (
        <ion-button size="large" color="medium" fill="clear" slot="end" onClick={(evt) => getBarCodePopOver({
          type: "code128",
          size: "32",
          scale: "6",
          data: self.gtin
        }, evt)}>
          <ion-icon slot="icon-only" name="barcode"></ion-icon>
        </ion-button>
      )
    }

    return [
      <ion-item class="ion-margin-vertical">
        <ion-label position="floating">{self.nameString}</ion-label>
        <ion-input name="input-name" required={true} maxlength={30} disabled={!self.isCreate()} value={self.isCreate() ? '' : (self.product ? self.product.name : '')}></ion-input>
        {getRandomNameButton()}
      </ion-item>,
      <ion-item class="ion-margin-bottom">
        <ion-label position="floating">{self.gtinString}</ion-label>
        <ion-input name="input-gtin" type="number" required={true} maxlength={14} minlength={14} disabled={!self.isCreate()} value={self.isCreate() ? '' : (self.product ? self.product.gtin : '')}></ion-input>
        {isCreate ? getRandomGtinButton() : getBarCodeButton()}
      </ion-item>,
      <ion-item class="ion-margin-bottom">
        <ion-label position="floating">{self.manufString}</ion-label>
        <ion-input name="input-manufName" required={true} disabled={true} value={self.manufName}></ion-input>
      </ion-item>,
      <ion-item class="ion-margin-bottom">
        <ion-label position="floating">{self.descriptionString}</ion-label>
        <ion-textarea name="input-description" required={true} rows={6} cols={20} placeholder={self.descriptionPlaceholderString}
                      maxlength={500} spellcheck={true} disabled={!self.isCreate()} value={self.isCreate() ? '' : (self.product ? self.product.description : '')}></ion-textarea>
      </ion-item>
    ]
  }

  getCreate(){
    if (!this.isCreate())
      return [];
    return this.getInputs();
  }

  getManage() {
    if (this.isCreate())
      return;
    // this.navigateToTab(tab-batch', { gtin: this.gtin, batchNumber: undefined })
    return (
      <pdm-ion-table table-title={this.batchesTitle + ` ${this.gtin}`}
                     item-reference="gtin-batch"
                     query={this.gtin}
                     auto-load={true}
                     canQuery={false}
                     paginated={true}
                     manager="BatchManager"
                     icon-name="stats-chart"
                     item-type="managed-batch-list-item"
                     items-per-page="5">
        <ion-button slot="buttons" color="secondary" fill="solid" onClick={() => this.navigateToTab()}>
          {this.batchesAddButton}
          <ion-icon slot="end" name="add-circle"></ion-icon>
        </ion-button>
      </pdm-ion-table>
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
        <create-manage-view-layout create-title-string={this.titleString}
                                   manage-title-string={this.manageString}
                                   back-string={this.backString}
                                   create-string={this.addProductString}
                                   clear-string={this.clearString}
                                   break-point="xl-4"
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
          <div slot="view"></div>
        </create-manage-view-layout>
      </Host>
    );
  }


}

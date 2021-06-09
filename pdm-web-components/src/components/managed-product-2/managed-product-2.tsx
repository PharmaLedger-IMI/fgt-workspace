import {Component, Host, h, Element, Event, EventEmitter, Prop, State, Watch, Method} from '@stencil/core';
import {HostElement} from "../../decorators";
import wizard from '../../services/WizardService';
import {WebManager, WebManagerService} from "../../services/WebManagerService";
import {getBarCodePopOver} from "../../utils/popOverUtils";

const {generateGtin, generateProductName} = wizard.Model.utils;
const Product = wizard.Model.Product;

@Component({
  tag: 'managed-product-2',
  styleUrl: 'managed-product-2.css',
  shadow: false,
})
export class ManagedProduct2 {

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
  @Prop({attribute: "cancel-string"}) cancelString: string = "cancel"

  @Prop({attribute: 'batches-title-string', mutable: true}) batchesTitle: string = "Batches for";
  @Prop({attribute: 'batches-add-button-string', mutable: true}) batchesAddButton: string = "Add Batch";

  private productManager: WebManager = undefined;

  @State() errors: any = {}

  @State() product: typeof Product = undefined;

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
    this.productManager = await WebManagerService.getWebManager("ProductManager");
    await this.loadProduct();
  }

  async loadProduct(){
    let self = this;
    if (!self.productManager)
      return;

    if (this.isCreate()){
      this.product = undefined;
      return this.clearInputFields();
    }

    self.productManager.getOne(self.gtin, true, (err, product) => {
      if (err){
        self.sendError(`Could not get Product with gtin ${self.gtin}`, err);
        return;
      }
      this.product = product;
      self.refreshTable();
    });
  }

  private refreshTable(){
    const table = this.element.querySelector('pdm-ion-table');
    if (table)
      table.refresh();
  }


  @Watch('gtin')
  @Method()
  // @ts-ignore
  async refresh(newGtin, oldGtin){
    await this.loadProduct();
  }

  private navigateBack(evt?){
    if (evt){
      evt.preventDefault();
      evt.stopImmediatePropagation();
    }
    this.navigateToTab('tab-products', {});
  }

  private getAllInputs(){
    return this.element.querySelectorAll(`input[name^="input-"], textarea[name^="input-"]`);
  }

  private clearInputFields(){
    Array.prototype.filter.call(this.getAllInputs(), el => el.name !== 'input-manufName')
      .forEach(input => {
        if (input.name === 'input-description'){
          input.closest('ion-textarea').value = '';
          return;
        }
        input.closest('ion-input').value = '';
      })
  }

  private createProduct(evt?){
    if (evt){
      evt.preventDefault();
      evt.stopImmediatePropagation();
    }

    const trimInputToProp = function(el){
      return el.name.substring('input-'.length);
    }
    const product = new Product();
    const inputFields = this.getAllInputs();
    for (let prop in product)
      if (product.hasOwnProperty(prop)){
        const input = Array.prototype.filter.call(inputFields, el => prop === trimInputToProp(el));
        if (!input.length){
          console.log(`Could not find input field for attribute ${prop}`);
          continue;
        }
        product[prop] = input[0].value;
      }

    this.sendCreateAction.emit(product);
  }

  private setRandomGtin(){
    const el = this.element.querySelector(`input[name="input-gtin"]`).closest('ion-input');
    el.setFocus();
    el.value = generateGtin();
  }

  private setRandomName(){
    const el = this.element.querySelector(`input[name="input-name"]`).closest('ion-input');
    el.setFocus();
    el.value = generateProductName();
  }

  private isCreate(){
    return !this.gtin || this.gtin.startsWith('@');
  }

  private getFields(){
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

  render() {
    if (!this.host.isConnected)
      return;
    return (
      <Host>
        <create-manage-view-layout create-title-string={this.titleString}
                                   manage-title-string={this.manageString}
                                   back-string={this.backString}
                                   create-string={this.addProductString}
                                   clear-string={this.cancelString}
                                   icon-name="layers"
                                   is-create={this.isCreate()}
                                   onGoBackEvent={(evt) => this.navigateBack(evt)}
                                   onCreateEvent={(evt) => this.createProduct(evt)}>
          <div slot="create">
            {...this.getFields()}
          </div>
          <div slot="manage">
            <pdm-ion-table table-title={this.batchesTitle + ` ${this.gtin}`}
                           item-reference="gtin-batch"
                           query={this.gtin}
                           canQuery={false}
                           paginated={true}
                           manager="BatchManager"
                           icon-name="stats-chart"
                           item-type="managed-batch-list-item"
                           items-per-page="5">
              <ion-button slot="buttons" color="secondary" fill="solid" onClick={() => this.navigateToTab('tab-batch', {
                gtin: this.gtin,
                batchNumber: undefined
              })}>
                {this.batchesAddButton}
                <ion-icon slot="end" name="add-circle"></ion-icon>
              </ion-button>
            </pdm-ion-table>
          </div>
          <div slot="view"></div>
        </create-manage-view-layout>
      </Host>
    );
  }
}

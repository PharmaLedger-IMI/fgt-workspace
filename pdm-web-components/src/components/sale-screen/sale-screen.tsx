import {Component, Host, h, Prop, Element, State, Event, EventEmitter, Listen, Watch, Method} from '@stencil/core';
import {WebManagerService} from "../../services";
import {HostElement} from "../../decorators";
import {WebManager} from "../../services/WebManagerService";
import wizard from '../../services/WizardService';

const {Sale, IndividualProduct} = wizard.Model;

@Component({
  tag: 'sale-screen',
  styleUrl: 'sale-screen.css',
  shadow: false,
})
export class SaleScreen {

  @HostElement() host: HTMLElement;

  @Element() element;

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
      console.log(`Tab Navigation request seems to have been ignored by all components...`);
  }

  @Prop({attribute: 'sale-ref', mutable: true, reflect: true}) saleRef?: string = undefined;

  // strings
  @Prop({attribute: "create-title-string"}) titleString: string = "Title String";
  @Prop({attribute: "manage-title-string"}) manageString: string = "Manage String";
  @Prop({attribute: "back-string"}) backString: string = "Back to Products";
  @Prop({attribute: "scanner-title-string"}) scanString: string = "Please Scan your Product";


  @Prop({attribute: "product-string"}) productString:string = "Please select or scan the products:";
  @Prop({attribute: "selected-product-string"}) selectedProductString:string = "Selected products:";
  @Prop({attribute: "quantity-string"}) quantityString:string = "Please select a quantity:";

  @Prop({attribute: "create-string"}) createString:string = "Issue Sale";
  @Prop({attribute: "clear-string"}) clearString: string = "Clear";
  @Prop({attribute: 'directory-string', mutable: true}) directoryString: string = 'Directory:';

  // Directory Variables
  private saleManager: WebManager = undefined;

  @State() products?: string[] = undefined;

  @State() sale: typeof Sale = undefined;

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
    this.saleManager = await WebManagerService.getWebManager('SaleManager');
    await this.loadSale();
  }

  @Method()
  async updateDirectory(){
    const self = this;
    const input = self.element.querySelector('managed-stock-product-input');
    if (input)
      input.updateDirectory();
  }

  private async loadSale(){
    if (!this.saleManager)
      return;
    if (!this.saleRef || this.saleRef.startsWith('@')){
      this.sale = undefined;
      return;
    }

    const self = this;
    self.saleManager.getOne(this.saleRef, true, (err, sale) => {
      if (err)
        return self.sendError(`Could not get sale ${self.saleRef}`, err);
      self.sale = sale;
    });
  }

  @Watch('saleRef')
  @Method()
  async refresh(){
    await this.updateDirectory();
    await this.loadSale();
  }

  @Listen('ssapp-action')
  async create(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.sendAction.emit(new Sale({
      productList: this.products.map(p => new IndividualProduct(p))
    }));
  }

  private isCreate(){
    return !this.saleRef || this.saleRef.startsWith('@');
  }

  private getCreate(){
    if (!this.isCreate())
      return;
    return this.getInputs();
  }

  private getInputs(){
    return (
      <managed-stock-product-input name="input-sale"
                                   required={true}
                                   disabled={!this.isCreate()}
                                   label-position="floating"
                                   lines="inset"
                                   products-code-string={this.productString}
                                   products-string={this.selectedProductString}
                                   quantity-string={this.quantityString}
      ></managed-stock-product-input>
    )
  }

  getPostCreate(){
    if (this.isCreate())
      return;
    return this.getInputs();
  }


  private getManage(){


  }

  private getView() {
  }

  navigateBack(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.navigateToTab(`tab-sales`, {});
  }

  render() {
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
            {this.getCreate()}
          </div>
          <div slot="postcreate">
            {this.getPostCreate()}
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

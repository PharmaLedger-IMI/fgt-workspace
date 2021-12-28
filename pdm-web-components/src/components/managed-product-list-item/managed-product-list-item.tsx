import {Component, Host, h, Element, Prop, State, Watch, Method, Event, EventEmitter} from '@stencil/core';
import {getBarCodePopOver} from '../../utils/popOverUtils';
import {WebManager, WebManagerService} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import wizard from '../../services/WizardService';
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
import {ListItemLayout} from "../list-item-layout/list-item-layout";

const Product = wizard.Model.Product;

@Component({
  tag: 'managed-product-list-item',
  styleUrl: 'managed-product-list-item.css',
  shadow: false,
})
export class ManagedProductListItem {

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

  @Prop({attribute: "gtin", mutable: true}) gtin: string;
  @Prop({attribute: "batch-display-count", mutable: true}) batchDisplayCount: number = 3;
  @Prop() isHeader: boolean;

  private productManager: WebManager = undefined;
  private batchManager: WebManager = undefined;

  @State() product: typeof Product = undefined;
  @State() batches: string[] = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.productManager = await WebManagerService.getWebManager("ProductManager");
    this.batchManager = await WebManagerService.getWebManager("BatchManager");
    return await this.loadProduct();
  }

  async loadProduct(){
    let self = this;
    if (!self.productManager)
      return;

    if(!self.isHeader)   
      self.productManager.getOne(self.gtin, true, (err, product) => {
        if (err){
          self.sendError(`Could not get Product with gtin ${self.gtin}`, err);
          return;
        }
        this.product = product;
        self.batchManager.getAll(false, {query: `gtin == ${self.gtin}`}, (err, batches) => {
          if (err){
            self.sendError(`Could not load batches for product ${self.gtin}`);
            return;
          }
          self.batches = batches;
        });
      });
  }

  private triggerSelect(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    console.log(`Selected ${evt.detail}`);
    const split = evt.detail.split('-');
    this.navigateToTab('tab-batch', {
      gtin: split[0],
      batchNumber: split[1]
    })
  }

  @Watch('gtin')
  @Method()
  async refresh(){
    await this.loadProduct();
  }

  addBatches(){
    const self = this;

    if(self.isHeader){
      return (
            <ion-col slot="content" color="secondary" size= "auto">
              <ion-label color="secondary">
                {"Batches"}
              </ion-label>       
            </ion-col>
      )
    }

    if (!self.product || !self.batches)
      return (<multi-spinner slot="content" type={SUPPORTED_LOADERS.bubblingSmall}></multi-spinner>);

    const dummyProp = Date.now(); // to ensure the item organizer updates even with the same data
    return(
      <pdm-item-organizer slot="content" component-name="batch-chip"
                          component-props={JSON.stringify(self.batches.map(gtinBatch => ({
                            "gtin-batch": gtinBatch,
                            "mode": "detail",
                            "loader-type": SUPPORTED_LOADERS.bubblingSmall,
                            "dummy-prop": dummyProp
                          })))}
                          id-prop="gtin-batch"
                          is-ion-item="false"
                          more-chips-position="start"
                          orientation={this.getOrientation()}
                          display-count-divider="257"
                          onSelectEvent={this.triggerSelect.bind(this)}></pdm-item-organizer>
    )
  }

  private getOrientation(){
    const layoutEl: ListItemLayout = this.element.querySelector('list-item-layout');
    return layoutEl ? layoutEl.orientation : 'end';
  }

  addButtons(){
    let self = this;

    const getMockButton = function(){
      return (
        <ion-button slot="buttons" color="secondary" fill="clear" disabled="true">
          <ion-icon size="large" slot="icon-only" name="some-name"></ion-icon>
          {/* <ion-icon size="large" slot="icon-only" name="information-circle-sharp"></ion-icon> */}
        </ion-button>
      )
    }

    if(self.isHeader)
      return[
        getMockButton(),
        getMockButton()
      ]

    if (!self.product)
      return (<ion-skeleton-text animated></ion-skeleton-text>);

    const getButton = function(slot, color, icon, handler){
      return (
        <ion-button slot={slot} color={color} fill="clear" onClick={handler}>
          <ion-icon size="large" slot="icon-only" name={icon}></ion-icon>
        </ion-button>
      )
    }

    return [
        getButton("buttons", "medium", "barcode", (evt) => getBarCodePopOver({
          type: "code128",
          size: "32",
          scale: "6",
          data: self.gtin
        }, evt)),
        getButton("buttons", "medium", "eye", () => self.navigateToTab('tab-product', {gtin: self.gtin}))
   ]
  }

  addGtinLabel(){
    const self = this;

    const getGtinLabel = function(){
      if(self.isHeader)
        return "Gtin";

      if (!self.product || !self.product.gtin)
        return (<ion-skeleton-text animated></ion-skeleton-text>);

      return self.product.gtin;
    }

    return(
      <ion-label slot="label0" color="secondary">
          {getGtinLabel()}
      </ion-label>
    )
  }

  addNameLabel(){
    const self = this;

    const getNameLabel = function(){
      if(self.isHeader)
        return "Product Name";

      if (!self.product || !self.product.name)
        return (<ion-skeleton-text animated></ion-skeleton-text>);

      return self.product.name;
    }

    return(
      <ion-label slot="label1" color="secondary">
          {getNameLabel()}
      </ion-label>
    )
  }

  generateLabelLayoutConfig(){
    const obj = {
      0 : {
        sizeByScreen: {
          "xs": 4,
          "sm": 4,
          "md": 3,
          "lg": 3,
          "xl":2
        },
        center: false,
      },
      1 : {
        sizeByScreen: {
          "xs": 4,
          "sm": 4,
          "md": 3,
          "lg": 3,
          "xl":2
        },
        center: false,
      }, 
    }

    return JSON.stringify(obj);
  }

  render() {
    return (
      <Host>
        <list-item-layout-default buttons={true}  label-col-config={this.generateLabelLayoutConfig()}>
          {this.addGtinLabel()}
          {this.addNameLabel()}
          {this.addBatches()}
          {this.addButtons()}
        </list-item-layout-default>
      </Host>
    );
  }
}







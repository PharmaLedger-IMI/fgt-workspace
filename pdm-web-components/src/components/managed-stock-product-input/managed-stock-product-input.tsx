import {Component, Host, h, Prop, State, Element, Event, EventEmitter, Listen, Method, Watch} from '@stencil/core';
import {WebManager, WebManagerService} from "../../services/WebManagerService";
import {HostElement} from "../../decorators";
import {getProductPopOver} from "../../utils/popOverUtils";
import wizard from "../../services/WizardService";

const {Stock, IndividualProduct, Batch} = wizard.Model;

interface Batch {
  batchNumber: string;
  expiry: string;
  serialNumbers: string[];
  quantity: number;
  batchStatus: string;
  getQuantity: () => number;
}

@Component({
  tag: 'managed-stock-product-input',
  styleUrl: 'managed-stock-product-input.css',
  shadow: false,
})
export class ManagedStockProductInput {

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

  private sendError(message: string, err?: object){
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`Product Component: ${message}`, err);
  }

  @Prop({attribute: 'name'}) name: string;
  @Prop({attribute: 'required'}) required: boolean = false;
  @Prop({attribute: 'disabled', mutable: true, reflect: true}) disabled: boolean = false;

  @Prop({attribute: 'value', mutable: true, reflect: true}) value: string = '[]';

  @Prop({attribute: 'lines'}) lines: 'none' | 'inset' | 'full'  = 'inset';
  @Prop({attribute: 'label-position'}) labelPosition: "fixed" | "floating" | "stacked" = 'floating';

  // strings
  @Prop({attribute: 'products-string', mutable: true}) productsString: string = 'Products:';
  @Prop({attribute: 'products-code-string', mutable: true}) productsCodeString: string = 'Product Code:';
  @Prop({attribute: 'quantity-string', mutable: true}) quantityString: string = 'Quantity:';
  @Prop({attribute: 'directory-string', mutable: true}) directoryString: string = 'Directory:';


  // Directory Variables
  private stockManager: WebManager = undefined;
  private batchManager: WebManager = undefined;
  private saleManager: WebManager = undefined;
  @State() products?: (typeof IndividualProduct)[] = [];

  @State() stock?: string[] = undefined;

  @State() currentGtin?: string = undefined;

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
    this.stockManager = await WebManagerService.getWebManager('StockManager');
    this.batchManager = await WebManagerService.getWebManager('BatchManager');
    this.saleManager = await WebManagerService.getWebManager('SaleManager');
  }

  @Listen('ssapp-action')
  async handleAction(evt){
    if (!evt.detail.action)
      return;
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const {action, individualProduct} = evt.detail;
    if (action !== 'remove')
      return console.log(`invalid action received`);
    this.removeProduct(individualProduct);
  }

  private removeProduct(product){
    const {gtin, batchNumber, serialNumber} = product;
    const filter = this.products.filter((p) => {
      return `${p.gtin}-${p.batchNumber}-${p.serialNumber}` !== `${gtin}-${batchNumber}-${serialNumber}`
    })
    this.products = [...filter];
  }

  private addProductToBasket(p: (typeof IndividualProduct)) {
    const product = new IndividualProduct(p);
    if (!product.serialNumber) {
      return this.sendError(`Product ${product.gtin}-${product.name} out of stock.`);
    }
    const previousProducts: (typeof IndividualProduct)[] = this.products || [];
    this.products = [...previousProducts, product];
  }


  private addProduct(gtin: string | {}){
    const self = this;

    if (typeof gtin !== 'string')
      return self.addProductToBasket(gtin);

    self.stockManager.getOne(gtin, true, (err, stock: typeof Stock) => {
      if (err)
        return self.sendError(`No stock found for the selected product ${gtin}`);
      if (stock.getQuantity() < 1)
        return self.sendError(`The current stock for ${gtin} is not enough for ${gtin} items`);
      const sortedBatches = stock.batches.filter(b => b.getQuantity() > 0).sort((a, b) => {
        return a.expiry.getTime() - b.expiry.getTime();
      });

      const selectProduct = (_gtin: string, batches: Batch[], callback) => {
        const batch = batches.shift();
        if (!batch)
          return callback(`No more stock available for the selected product ${gtin}`);

        self.saleManager.getAll(true, [`gtin == ${_gtin}`, `batchNumber == ${batch.batchNumber}`], (err, sales) => {
          if (err)
            return callback(`Could not retrieve sale information for ${_gtin}'s ${batch.batchNumber}`, err);

          const saleIterator = (sales, result, callback) => {
            const sale = sales.shift();
            if (!sale)
              return callback(undefined, result);
            const serials = sale.productList.reduce((accum, product) => {
              if (product.gtin === _gtin && product.batchNumber === batch.batchNumber)
                accum.push(product.serialNumber);
              return accum;
            }, []);
            saleIterator(sales, [...result, ...serials], callback);
          }

          saleIterator(sales, [], (err, productsAlreadySold) => {
            if (err)
              return callback(`Could not retrieve sale information for ${_gtin}'s ${batch.batchNumber}`, err);

            self.batchManager.getOne(`${_gtin}-${batch.batchNumber}`, true, (err, constBatch: Batch) => {
              if (err)
                return callback(`Could not retrieve batch information for ${_gtin}'s ${batch.batchNumber}`, err);

              const serialsInBasket: string[] = self.products.reduce((accum, p) => {
                if (p.gtin === gtin && p.batchNumber === batch.batchNumber)
                  accum.push(p.serialNumber);
                return accum;
              }, []);

              // not available products in this batch, select the next batch
              if (serialsInBasket.length >= batch.getQuantity())
                return selectProduct(_gtin, batches, callback);

              // if still have products available on this batch
              const availableSerials = constBatch.serialNumbers.slice(serialsInBasket.length);
              const serialNumber = availableSerials.find((serial) => {
                // not to add products that are already in the basket and not to add products already sold
                return serialsInBasket.indexOf(serial) < 0 && productsAlreadySold.indexOf(serial) < 0;
              });
              if (serialNumber === undefined)
                return selectProduct(_gtin, batches, callback);
              callback(undefined, {batch: batch, serialNumber: serialNumber});
            })
          })
        })
      }

      selectProduct(gtin, sortedBatches, (err, selectedProduct) => {
        if (err)
          return self.sendError(err);

        const {batch, serialNumber} = selectedProduct;
        self.addProductToBasket({
          gtin: gtin,
          name: stock.name,
          manufName: stock.manufName,
          batchNumber: batch.batchNumber,
          expiry: batch.expiry,
          status: batch.batchStatus,
          serialNumber: serialNumber
        });
      })
    });
  }

  @Watch('products')
  async updateResult(newValue){
    if (!newValue || !newValue.length){
      this.value = "[]";
      return;
    }
    this.value = JSON.stringify(newValue);
  }

  @Watch('value')
  async updateValue(newValue){
    if (!newValue || newValue === "[]")
      if (this.products && this.products.length)
        this.products = [];
  }

  @Method()
  async updateDirectory(gtin = ''){
    const self = this;

    self.stockManager.getAll(false, {
      query: [
        '__timestamp > 0',
        `gtin like /^${gtin}.*$/g`
      ],
      sort: 'dsc'
    }, (err, stocks) => {
      if (err)
        return self.sendError(`Could not Retrieve stock`, err);
      self.stock = [...stocks];
    });
  }

  private async updateProductsInStock(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();

    const self = this;
    self.currentGtin = evt.detail.value;
    await self.updateDirectory(self.currentGtin);
  }

  private async showProductPopOver(evt){
    const popover = await getProductPopOver(evt, this.stock);
    const {role} = await popover.onWillDismiss();
    if (role && role !== 'backdrop')
      this.addProduct(role);
  }

  private scan(){
    const self = this;
    const controller = self.element.querySelector('pdm-barcode-scanner-controller')
      || document.querySelector('pdm-barcode-scanner-controller');

    if (!controller)
      return console.log(`Could not find scan controller`);
    controller.present((err, scanData) => {
      if (err)
        return self.sendError(`Could not scan`, err);
      if (!scanData)
        return console.log(`No scan data received`);
      console.log(scanData);
      self.addProduct(scanData ? scanData.gtin || scanData.productCode || scanData.result: undefined);
    });
  }

  private getProductInput(){
    return (
      <ion-item lines={this.lines}>
        <ion-label position={this.labelPosition}>
          {this.productsCodeString}
        </ion-label>
        <ion-input id="input-product" name="" type="number" onIonChange={this.updateProductsInStock.bind(this)}></ion-input>
        <ion-buttons slot="end">
          <ion-button onClick={this.scan.bind(this)} color="medium" size="large" fill="clear">

            <ion-icon slot="icon-only" name="scan-circle"></ion-icon>
          </ion-button>
          <ion-button onClick={this.showProductPopOver.bind(this)} disabled={!this.stock || !this.stock.length} color="secondary" size="large" fill="clear">
            <ion-icon slot="icon-only" name="add-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-item>
    )
  }

  private getProductsDisplay(){
    if (!this.products)
      return (
        <ion-label>No Products Selected</ion-label>
      );
    return (
      <ion-list>
        {this.products.map(ip => <managed-individual-product-list-item gtin-batch-serial={`${ip.gtin}-${ip.batchNumber}-${ip.serialNumber}`} show-track-button ="false"></managed-individual-product-list-item>)}
      </ion-list>

    )
  }

  private getInputElement(){
    return (
      <input name={this.name} required={this.required} hidden={true} value={this.value}></input>
    )
  }

  render() {
    return (
      <Host>
        {this.getProductInput()}
        {this.getInputElement()}
        {this.getProductsDisplay()}
      </Host>
    );
  }
}

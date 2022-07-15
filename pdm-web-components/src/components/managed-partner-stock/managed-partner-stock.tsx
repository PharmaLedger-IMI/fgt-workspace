import {Component, Host, h, Element, Event, EventEmitter, Prop, State, Watch, Method, Listen, JSX} from '@stencil/core';
import {HostElement} from "../../decorators";
import {WebManager, WebManagerService} from "../../services/WebManagerService";

interface Product {
  name: string;
  gtin: string;
}

interface Batch {
  batchNumber: string;
}

@Component({
  tag: 'managed-partner-stock',
  styleUrl: 'managed-partner-stock.css',
  shadow: false,
})
export class ManagedPartnerStock {

  @HostElement() host: HTMLElement;

  @Element() element;

  private gtinInputId = "input-gtin";
  private batchInputId = "input-batch";
  private partnerInputId = "input-partner";

  private chartOptions = {
    plugins: {
      title: {display: false},
      legend: false
    }
  };

  // Managers
  private stockManager: WebManager = undefined;
  private batchManager: WebManager = undefined;

  @Prop({attribute: 'header-title', mutable: true}) headerTitle: string = 'Partner Stock Traceability';
  @Prop({attribute: 'header-icon', mutable: true}) headerIcon: string = 'git-branch';

  @Prop({attribute: 'gtin-input-label', mutable: true}) productInputLabel: string = 'Product:';
  @Prop({attribute: 'batch-input-label', mutable: true}) batchInputLabel: string = 'Batch:';
  @Prop({attribute: 'partner-input-label', mutable: true}) partnerInputLabel: string = 'Partner:';

  @State() products?: Product[] = undefined;
  @State() batches?: string[] = undefined;
  @State() partners?: string[] = undefined;

  @State() partnerStock?: {} = undefined;

  @State() currentProduct?: Product = undefined;
  @State() currentBatch?: string = undefined;
  @State() currentPartner?: string = undefined;
  @State() currentPartnersStock: any = {};

  @Listen('ionChange')
  async onInputChange(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const {target} = evt;
    const {name, value} = target;
    console.log("onInputChange=", name, value)
    if (name === this.gtinInputId) {
      this.currentProduct = this.products.find((product) => product.gtin === value);
      // reset chart from "batch" visualization mode
      this.currentBatch = undefined;
      this.currentPartner = undefined;
    }

    if (name === this.batchInputId)
      this.currentBatch = value;

    if (name === this.partnerInputId)
      this.currentPartner = value;
  }

  @Listen('chart-action')
  async onChartAction(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const {label} = evt.detail;
    if (label && !this.currentPartner) // !this.currentPartner -> check if chart view is already in "batch" visualization mode
      this.currentPartner = label;
  }

  /** Through this event errors are passed*/
  @Event({
    eventName: 'ssapp-send-error',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendErrorEvent: EventEmitter;

  private sendError(message: string, err?: object) {
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`managed-partner-stock component: ${message}`, err);
  }

  private async getProductsInStock(): Promise<Product[]> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.stockManager.getAll(true, {}, (err: any, records: Product[]) => {
        if (err) {
          self.sendError(typeof err === "string" ? err : err.message, err);
          return reject(err);
        }
        resolve(records);
      });
    })
  }

  private async getPartnersStock(gtin: string, batch?: string, partnerId?: string): Promise<any> {
    const self = this;
    const options = {}
    if (batch)
      options["batch"] = batch;
    if (partnerId)
      options["partnerId"] = partnerId;

    return new Promise((resolve, reject) => {
      self.stockManager.getStockTraceability(gtin, options, (err, partnerStock) => {
        if (err) {
          self.sendError(typeof err === "string" ? err : err.message, err);
          return reject(err);
        }
        resolve(partnerStock);
      })
    })
  }

  private async getBatches(gtin: string): Promise<string[]> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.batchManager.getAll(true, {query: `gtin == ${gtin}`}, (err: any, batches: Batch[]) => {
        if (err) {
          self.sendError(typeof err === "string" ? err : err.message, err);
          return reject(err);
        }
        resolve(batches.map((batch) => batch.batchNumber));
      })
    })
  }

  private getInputs() { // render lifecycle

    const getInputLabel = (label: string, input: any | undefined, options: any = {}): JSX.Element => {
      const {required, disabled} = Object.assign(
        {required: false, disabled: false},
        options
      );

      const reqEl = required ? "*" : "";
      if (!input)
        input = (<ion-skeleton-text animated></ion-skeleton-text>);
      return (
        <ion-item lines="none" disabled={disabled} class="ion-margin-top">
          <ion-label position="stacked">{label}{reqEl}</ion-label>
          {input}
        </ion-item>
      )
    }

    const getSelectInput = (inputId: string, items: any[] | undefined, value?: string) => {
      if (!items)
        return <ion-skeleton-text animated></ion-skeleton-text>

      const selects = items.map(item => (<ion-select-option value={item}>{item}</ion-select-option>));
      return (
        <ion-select name={inputId} value={value} interface="popover">
          {...selects}
        </ion-select>
      );
    };

    const getSelectProductInput = (inputId: string, products: Product[] | undefined, value?: string) => {
      if (!products)
        return <ion-skeleton-text animated></ion-skeleton-text>

      const selects = products.map(product => (
        <ion-select-option value={product.gtin}>{product.name} ({product.gtin})</ion-select-option>));
      return (
        <ion-select name={inputId} value={value} interface="popover">
          {...selects}
        </ion-select>
      );
    };

    const inputs = [];

    // product
    const productSelects = getSelectProductInput(this.gtinInputId, this.products, this.currentProduct?.gtin);
    inputs.push(getInputLabel(this.productInputLabel, productSelects, {required: true}));


    if (this.currentProduct && Object.keys(this.currentProduct).length > 0) {
      // batches
      const batchesInputSelects = getSelectInput(this.batchInputId, this.batches || [], this.currentBatch);
      inputs.push(getInputLabel(this.batchInputLabel, batchesInputSelects));

      // partners
      const partnersInputSelects = getSelectInput(this.partnerInputId, this.partners || [], this.currentPartner);
      inputs.push(getInputLabel(this.partnerInputLabel, partnersInputSelects));
    }

    return inputs;
  }

  getChart() {
    const self = this;
    if (!this.currentProduct)
      return (<span></span>);

    const getPartnerStockData = (partnerStock: any): { [key: string]: number } => {
      return Object.keys(partnerStock).reduce((accum, partnerId) => {
        accum[partnerId] = partnerStock[partnerId]["inStock"];
        return accum;
      }, {})
    }

    let chartData = {};
    if (!self.currentPartner) // "gtin" visualization mode
      chartData = getPartnerStockData(self.partnerStock['partnersStock']);
    else // "batch" visualization mode
      chartData = self.currentPartnersStock;

    let cardTitle = `${this.currentProduct.name}, GTIN: ${this.currentProduct.gtin}`;
    cardTitle += this.currentBatch ? ` Batch: ${this.currentBatch}` : "";
    cardTitle += this.currentPartner ? ` in ${this.currentPartner} stock` : "";

    return (
      <pdm-chartjs
        container-id="partner-stock-chart"
        card-title={cardTitle}
        card-sub-title=""
        data={JSON.stringify({
          labels: Object.keys(chartData),
          datasets: [
            {
              backgroundColor: ["#76c893", "#52b69a", "#34a0a4", "#168aad", "#1a759f", "#1e6091", "#184e77"],
              data: Object.values(chartData)
            }
          ]
        })}
        options={JSON.stringify(self.chartOptions)}
      ></pdm-chartjs>
    )
  }

  private reset() {
    this.currentProduct = undefined;
    this.currentBatch = undefined;
    this.currentPartner = undefined;
  }

  private getHeader(){
    return (
      <div class="flex ion-align-items-center">
        <ion-icon name={this.headerIcon} size="large" color="secondary"></ion-icon>
        <ion-label class="ion-text-uppercase ion-padding-start" color="secondary">
          {this.headerTitle}
        </ion-label>
      </div>
    )
  }

  async componentWillLoad() {
    this.stockManager = await WebManagerService.getWebManager("StockManager");
    this.batchManager = await WebManagerService.getWebManager("BatchManager");
    this.products = await this.getProductsInStock();
  }

  async componentWillUpdate() {
    this.products = await this.getProductsInStock();
    if (this.currentProduct && this.currentProduct.hasOwnProperty("gtin")) {
      this.partnerStock = await this.getPartnersStock(this.currentProduct.gtin, this.currentBatch, this.currentPartner);
      this.partners = Object.keys(this.partnerStock["partnersStock"]);
      this.batches = await this.getBatches(this.currentProduct.gtin);
    }

    const self = this;
    if (this.currentPartner || this.currentBatch) {
      const accum = {}
      const batchesToSearch = this.currentBatch ? [this.currentBatch] : (self.batches || []);

      await Promise.all([...batchesToSearch].map(async (batchNumber) => {
        const partnerStock = (await self.getPartnersStock(self.currentProduct.gtin, batchNumber, self.currentPartner))["partnersStock"];
        let qty;
        if (self.currentPartner && partnerStock.hasOwnProperty(self.currentPartner))
          qty = partnerStock[self.currentPartner]["inStock"] || 0;
        else {
           qty = Object.values(partnerStock).reduce((total: number, value: {inStock: number, dispatched: number}) => {
            return total + (value.inStock || 0);
          }, 0);
        }
        if (qty > 0)
          accum[batchNumber] = qty;
      }));

      this.currentPartnersStock = {...accum};
    }
  }

  render() {
    const self = this;
    console.log("$$$ managed partner stock")
    if (!self.host.isConnected)
      return;
    return (
      <Host>
        <div class="ion-margin-bottom ion-padding-horizontal">
          <ion-row class="ion-align-items-center ion-justify-content-between">
            {this.getHeader()}
          </ion-row>
        </div>
        <ion-row class="ion-margin">
          <ion-grid>
            <ion-row>
              <ion-col size="12" size-lg="8">
                {...self.getInputs()}
              </ion-col>
              <ion-col>
                <ion-button class="ion-float-end" color="primary" fill="clear" onClick={() => self.reset()}>Reset</ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-row>

        <div class="l-chart">
          <ion-row class="ion-margin">
            <ion-col size="12" size-lg="8">
              {self.getChart()}
            </ion-col>
          </ion-row>
        </div>

      </Host>
    );
  }
}

import {Component, Host, h, Element, Prop, State, Watch, Method} from '@stencil/core';
import HostElement from './../../decorators/HostElement';

// @ts-ignore
const Product = require('wizard').Model.Product;
// @ts-ignore
const WebComponentService = require('wizard').Services.WebComponentService;

@Component({
  tag: 'product-list-item2',
  styleUrl: 'product-list-item2.css',
  shadow: false,
})
export class ProductListItem2 {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Prop() keySSI: string;

  private webComponentService;

  @State() product: typeof Product = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;

    this.webComponentService = this.webComponentService || new WebComponentService();
    await this.loadProduct();
  }

  @Watch('keySSI')
  async loadProduct(){
    if (!this.webComponentService)
      return;
    this.webComponentService.getInfo(this.keySSI, (err, info) => {
      if (err)
        return console.log(`Could not read info from keySSI ${this.keySSI}`);
      this.product = info;
    });
  }

  @Method()
  async refresh(){
    this.product = undefined;
    await this.loadProduct();
  }

  addBarCode(){
    const self = this;

    const getBarCode = function(){
      if (!self.product || !self.product.gtin)
        return (<ion-skeleton-text animated></ion-skeleton-text>);
      return (<barcode-generator class="ion-align-self-center" type="code128" size="32" scale="6" data={self.product.gtin}></barcode-generator>);
    }

    return(
      <ion-thumbnail className="ion-align-self-center" slot="start">
        {getBarCode()}
      </ion-thumbnail>
    )
  }

  addLabel(){
    const self = this;

    const getGtinLabel = function(){
      if (!self.product || !self.product.gtin)
        return (<h3><ion-skeleton-text animated></ion-skeleton-text> </h3>)
      return (<h3>{self.product.gtin}</h3>)
    }

    const getNameLabel = function(){
      if (!self.product || !self.product.name)
        return (<h5><ion-skeleton-text animated></ion-skeleton-text> </h5>)
      return (<h5>{self.product.name}</h5>)
    }

    const getDescriptionLabel = function(){
      if (!self.product || !self.product.description)
        return (<p><ion-skeleton-text animated></ion-skeleton-text> </p>)
      return (<p>{self.product.description}</p>)
    }

    return(
      <ion-label className="ion-padding-horizontal ion-align-self-center">
        {getGtinLabel()}
        {getNameLabel()}
        {getDescriptionLabel()}
      </ion-label>)
  }

  addBatch(batch){
    return(
      <ion-chip outline color="primary">
        <ion-label className="ion-padding-start">{batch.batchNumber}</ion-label>
        <ion-badge className="ion-margin ion-padding-horizontal" color="success">{batch.quantity}</ion-badge>
      </ion-chip>
    )
  }

  addBatches(){
    const batches = this.product && this.product.batches ? this.product.batches.map(b => this.addBatch(b)) : (<ion-skeleton-text animated></ion-skeleton-text>);
    return(
      <ion-grid className="ion-padding-horizontal">
        <ion-row>
          <ion-col size="12" data-for="@batches">
            {batches}
          </ion-col>
        </ion-row>
      </ion-grid>
    )
  }

  addButtons(){
    let self = this;
    const getButtons = function(){
      if (!self.product)
        return (<ion-skeleton-text animated></ion-skeleton-text>)
      return (
        <ion-button slot="primary">
          <ion-icon name="file-tray-stacked-outline"></ion-icon>
        </ion-button>
      )
    }

    return(
      <ion-buttons className="ion-align-self-center ion-padding" slot="end">
        {getButtons()}
      </ion-buttons>
    )
  }

  render() {
    return (
      <Host>
        <ion-item className="ion-align-self-center">
          {this.addBarCode()}
          {this.addLabel()}
          {this.addBatches()}
          {this.addButtons()}
        </ion-item>
      </Host>
    );
  }
}

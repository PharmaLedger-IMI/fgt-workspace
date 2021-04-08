import {Component, Host, h, Event, Element, EventEmitter} from '@stencil/core';
import HostElement from './../../decorators/HostElement';
import { extractChain, applyChain, promisifyEventEmit } from '../../utils';


@Component({
  tag: 'product-list-item',
  styleUrl: 'product-list-item.css',
  shadow: false,
})
export class ProductListItem {

  @HostElement() host: HTMLElement;

  @Element() element;

  /**
   * Through this event model is received (from webc-container, webc-for, webc-if or any component that supports a controller).
   */
  @Event({
    eventName: 'webcardinal:model:get',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  getModelEvent: EventEmitter;

  private model = undefined;
  private chain = '';

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;

    this.chain = extractChain(this.host);

    if (this.chain) {
      try {
        this.model = await promisifyEventEmit(this.getModelEvent);
        this.model = applyChain(this.model, this.chain);
      } catch (error) {
        console.error(error);
      }
    }
  }

  addBarCode(){
    if (!this.model || !this.model.gtin)
      return
    return(
      <ion-thumbnail className="ion-align-self-center" slot="start">
        <barcode-generator class="ion-align-self-center" type="code128" size="32" scale="6" data={this.model.gtin}></barcode-generator>
      </ion-thumbnail>
    )
  }

  addLabel(){
    return(
    <ion-label className="ion-padding-horizontal ion-align-self-center">
      <h3>{this.model.gtin}</h3>
      <h5>{this.model.name}</h5>
      <p>{this.model.description}</p>
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
    const batches = this.model.batches ? this.model.batches.map(b => this.addBatch(b)) : '';
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
    return(
      <ion-buttons className="ion-align-self-center ion-padding" slot="end">
        <ion-button slot="primary">
          <ion-icon name="file-tray-stacked-outline"></ion-icon>
        </ion-button>
      </ion-buttons>
    )
  }

  render() {
    if (!this.model)
      return;

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

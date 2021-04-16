import {Component, Host, h, Element, Prop, Watch} from '@stencil/core';
import {HostElement} from '../../decorators'


@Component({
  tag: 'product-list-item1',
  styleUrl: 'product-list-item1.css',
  shadow: false,
})
export class ProductListItem1 {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Prop() model = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
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

  @Watch('model')
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

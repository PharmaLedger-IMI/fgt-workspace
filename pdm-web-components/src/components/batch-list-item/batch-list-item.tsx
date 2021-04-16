import {Component, Host, h, Event, Element, EventEmitter} from '@stencil/core';
import {extractChain, promisifyEventEmit} from "../../utils";
import {HostElement} from '../../decorators'
import { applyChain } from "../../utils";


@Component({
  tag: 'batch-list-item',
  styleUrl: 'batch-list-item.css',
  shadow: false,
})
export class BatchListItem {

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
  private chain: string = '';

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    await this._getModel();
  }

  async _getModel(){
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
    if (!this.model || !this.model.batchNumber)
      return
    return(
      <ion-thumbnail className="ion-align-self-center" slot="start">
        <barcode-generator class="ion-align-self-center" size="16" type="gs1datamatrix" scale="3" data={this.model.batchNumber}></barcode-generator>
      </ion-thumbnail>
    )
  }

  addLabel(){
    return(
      <ion-label className="ion-padding-horizontal ion-align-self-center">
        <h3>{this.model.batchNumber}</h3>
        <h5>{this.model.expiry}</h5>
      </ion-label>)
  }

  addSerial(serial){
    return(
      <ion-chip outline color="primary">
        {serial}
      </ion-chip>
    )
  }

  addSerials(){
    // const serials = this.model.serialNumbers ? this.model.serialsNumbers.map(s => this.addSerial(s)) : '';
    // return(
    //   <ion-grid className="ion-padding-horizontal">
    //     <ion-row>
    //       <ion-col size="12">
    //         {serials}
    //       </ion-col>
    //     </ion-row>
    //   </ion-grid>
    // )
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
          {this.addSerials()}
          {this.addButtons()}
        </ion-item>
      </Host>
    );
  }
}

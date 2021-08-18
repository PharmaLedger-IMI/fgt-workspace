import {Component, Host, h, Prop, Event, EventEmitter} from '@stencil/core';
import {getBarCodePopOver} from "../../utils/popOverUtils";
import wizard from "../../services/WizardService";

const {utils} = wizard.Model;

@Component({
  tag: 'tracked-serial-chip',
  styleUrl: 'tracked-serial-chip.css',
  shadow: false,
})
export class TrackedSerialChip {

  @Prop({attribute: 'reference'}) reference: string;

  @Prop({attribute: "outline"}) outline?: boolean = true;

  @Prop({attribute: "color"}) color?: string = "secondary";

  @Event({
    eventName: 'ssapp-action',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendAction: EventEmitter;

  private triggerTrack(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.sendAction.emit({
      action: 'track',
      reference: this.splitReference()
    });
  }

  private splitReference(){
    const splitRef = this.reference.split('-');
    return {
      gtin: splitRef[0],
      batch: splitRef[1],
      serial: splitRef[2],
      expiry: splitRef[3]
    }
  }

  render() {
    const {gtin, batch, serial, expiry} = this.splitReference();
    return (
      <Host>
        <generic-chip chip-label={serial}
                      hide-buttons="false"
                      color={this.color}
                      outline={this.outline}>
          <ion-button slot="buttons" color="medium" fill="clear" onClick={(evt) => getBarCodePopOver({
            type: "code128",
            size: "32",
            scale: "6",
            data: utils.generate2DMatrixCode(gtin, batch, expiry, serial)
          }, evt)}>
            <ion-icon size="large" slot="icon-only" name="barcode"></ion-icon>
          </ion-button>
          <ion-button slot="buttons" onClick={this.triggerTrack.bind(this)} fill="clear">
            <ion-icon slot="icon-only" name="share-social"></ion-icon>
          </ion-button>
        </generic-chip>
      </Host>
    );
  }

}

import {Component, Host, h, Prop, Element} from '@stencil/core';
import {HostElement} from "../../decorators";


// @ts-ignore
const Batch = require('wizard').Model.Batch;

const CHIP_TYPE = {
  SIMPLE: "simple",
  DETAIL: "detail"
}

@Component({
  tag: 'generic-chip',
  styleUrl: 'generic-chip.css',
  shadow: false,
})
export class GenericChip {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Prop({attribute: "chip-label", mutable: true}) chipLabel: string = undefined;

  @Prop({attribute: "mode"}) mode?: string = CHIP_TYPE.SIMPLE;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }

  private renderSimple(){
    return (
      <Host>
        <ion-chip class="ion-padding-horizontal" outline={true} color="secondary">
          <ion-label>{this.chipLabel}</ion-label>
          <slot name="badges"></slot>
        </ion-chip>
      </Host>
    )
  }

  render() {
    switch(this.mode){
      case CHIP_TYPE.SIMPLE:
        return this.renderSimple();
      case CHIP_TYPE.DETAIL:
        return;
    }
  }
}

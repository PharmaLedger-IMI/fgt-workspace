import {Component, Host, h, Prop, Element} from '@stencil/core';
import {HostElement} from "../../decorators";

@Component({
  tag: 'generic-chip',
  styleUrl: 'generic-chip.css',
  shadow: false,
})
export class GenericChip {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Prop({attribute: "chip-label", mutable: true}) chipLabel: string = undefined;

  @Prop({attribute: "outline"}) outline?: boolean = true;

  @Prop({attribute: "color"}) color?: string = "secondary";

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }

  render() {
    return (
      <Host>
        <ion-chip class="ion-padding-horizontal" outline={this.outline} color={this.color}>
          <ion-label>{this.chipLabel}</ion-label>
          <slot name="badges"></slot>
          <slot name="buttons"></slot>
        </ion-chip>
      </Host>
    )
  }
}

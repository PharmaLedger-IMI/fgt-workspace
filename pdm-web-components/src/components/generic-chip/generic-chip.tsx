import {Component, Host, h, Prop, Element, Event, EventEmitter} from '@stencil/core';
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

  @Prop({attribute: "hide-buttons"}) hideButtons?: boolean = true;

  @Prop({attribute: "color"}) color?: string = "secondary";

  @Event({
    bubbles: false
  })
  selectEvent: EventEmitter<string>

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }

  private triggerSelect(){
    this.selectEvent.emit(this.chipLabel);
  }

  render() {
    return (
      <Host>
        <ion-chip outline={this.outline} color={this.color} onClick={() => this.triggerSelect()}>
          <ion-label class="ion-padding-horizontal">{this.chipLabel}</ion-label>
          <div class="badges-div ion-align-items-center ion-justify-content-between">
            <slot name="badges"></slot>
          </div>
          <div class={`${this.hideButtons ? "button-div" : "flex"} ion-align-items-center ion-justify-content-between`} >
            <slot name="buttons"></slot>
          </div>
        </ion-chip>
      </Host>
    )
  }
}

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

  @Prop({attribute: "color"}) color?: string = "secondary";

  @Prop({attribute:'class'}) cssClass?: string = '';

  @Prop({attribute: 'badges'}) badges = undefined

  @Prop({attribute: 'buttons'}) buttons = undefined;

  @Event()
  selectEvent: EventEmitter<string>

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }

  private getBadges(){
    if (!this.badges)
      return [];
    return [...this.badges()];
  }

  private getButtons(){
    if (!this.buttons)
      return [];
    return [...this.buttons()];
  }

  private triggerSelect(){
    console.log(`triggering select for ${this.chipLabel}`);
    this.selectEvent.emit(this.chipLabel);
  }

  render() {
    return (
      <Host>
        <ion-chip class={`ion-padding-horizontal${this.cssClass ? ` ${this.cssClass}` : ''}`} outline={this.outline} color={this.color} onClick={() => this.triggerSelect()}>
          <ion-label>{this.chipLabel}</ion-label>
          {...this.getBadges()}
          {...this.getButtons()}
        </ion-chip>
      </Host>
    )
  }
}

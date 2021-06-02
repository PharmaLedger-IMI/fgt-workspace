import {Component, h, Prop, Element, Event, EventEmitter} from '@stencil/core';
import {HostElement} from "../../decorators";

@Component({
  tag: 'more-chip',
  styleUrl: 'more-chip.css',
  shadow: false,
})
export class MoreChip {

  @HostElement() host: HTMLElement;

  @Element() element;

  /**
   * Through this event the clickEvent is passed
   */
  @Event({
    eventName: 'ssapp-show-more',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  showMoreEvent: EventEmitter;

  @Prop({attribute: 'icon-name'}) iconName: string = "ellipsis-horizontal";

  @Prop() color: string = 'medium';

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }

  private sendShowMoreEvent(evt){
    this.showMoreEvent.emit(evt);
  }

  render() {
    if (!this.host.isConnected)
      return;
    return (
      <ion-button fill="clear" size="small" color={this.color} onClick={(evt) => this.sendShowMoreEvent(evt)}>
        <ion-icon slot="icon-only" name={this.iconName}></ion-icon>
      </ion-button>
    )
  }
}

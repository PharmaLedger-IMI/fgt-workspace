import {Component, h, Prop, Element, Event, EventEmitter} from '@stencil/core';
import {HostElement} from "../../decorators";
import {EVENT_SHOW_MORE} from "../../constants/events";

@Component({
  tag: 'more-chip',
  styleUrl: 'more-chip.css',
  shadow: false,
})
export class BatchChip {

  @HostElement() host: HTMLElement;

  @Element() element;

  /**
   * Through this event errors are passed
   */
  @Event({
    eventName: EVENT_SHOW_MORE,
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  showMoreEvent: EventEmitter;

  @Prop() text?: string = undefined;

  @Prop({attribute: 'icon-name'}) iconName?: string = undefined;

  @Prop() color?: string = 'primary';

  @Prop() outline?: boolean = true;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }

  private getIcon(){
    if (!this.iconName)
      return;
    const props = {
      color: this.color,
      name: this.iconName
    }
    return (
      <ion-icon {...props}></ion-icon>
    )
  }

  private getText(){
    if (!this.text)
      return;
    return (
      <ion-label color={this.color}>{this.text}</ion-label>
    )
  }

  private sendShowMoreEvent(){
    this.showMoreEvent.emit();
  }

  render() {
    if (!this.host.isConnected)
      return;
    const props = {
      outline: this.outline,
      color: this.color
    }
    return (
      <ion-chip {...props} onClick={() => this.sendShowMoreEvent()}>
        {this.getIcon()}
        {this.getText()}
      </ion-chip>
    )
  }
}

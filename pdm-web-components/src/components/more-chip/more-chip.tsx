import {Component, h, Prop, Element, Event, Host, EventEmitter} from '@stencil/core';
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

  @Prop({attribute: 'label'}) label: string = undefined;

  @Prop({attribute: "color"}) color: string = 'medium';

  @Prop({attribute: "float-more-button"}) float: boolean = false;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }

  private sendShowMoreEvent(evt){
    evt.preventDefault()
    evt.stopImmediatePropagation();
    this.showMoreEvent.emit(evt);
  }

  private getButton(){
    const self = this;
    const getIconOrLabel = function(){
      if (self.label)
        return self.label;
      return (
        <ion-icon name={self.iconName}></ion-icon>
      )
    }

    if (this.float)
      return (
        <ion-fab vertical="top" horizontal="end">
          <ion-fab-button fill="solid" size="small" color={this.color} onClick={(evt) => this.sendShowMoreEvent(evt)}>
            {getIconOrLabel()}
          </ion-fab-button>
        </ion-fab>
      )

    return (
      <ion-button fill="clear" size="small" color={this.color} onClick={(evt) => this.sendShowMoreEvent(evt)}>
        {getIconOrLabel()}
      </ion-button>
    )
  }

  render() {
    if (!this.host.isConnected)
      return;
    return (
        <Host>
          {this.getButton()}
        </Host>
      )
  }
}

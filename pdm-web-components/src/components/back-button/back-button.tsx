import {Component, Host, h, Prop, Event, EventEmitter} from '@stencil/core';

@Component({
  tag: 'back-button',
  styleUrl: 'back-button.css',
  shadow: false
})
export class BackButton {

  @Prop({attribute: 'label'}) label: string = 'Go back';
  @Prop({attribute: 'color'}) color: string = 'secondary';
  @Prop({attribute: 'disabled'}) disabled: boolean = false;
  @Prop({attribute: 'expand'}) expand: string = 'full';
  @Prop({attribute: 'fill'}) fill: string = 'clear';
  @Prop({attribute: 'size'}) size: string = 'default';
  @Prop({attribute: 'shape'}) shape: string = 'default';
  @Prop({attribute: 'button-css-class'}) buttonCssClass: string = 'ion-margin-start';
  @Prop({attribute: 'icon-css-class'}) iconCssClass: string = 'ion-margin-end';
  @Prop({attribute: 'strong'}) strong: boolean = false;
  @Prop({attribute: 'hidden'}) hidden: boolean = false;

  @Event({
    eventName: 'ssapp-back-navigate',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  navigateBackEvent: EventEmitter;

  private handleClickButton(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const event = this.navigateBackEvent.emit();
    if (!event.defaultPrevented)
      console.log(`Back Navigation request seems to have been ignored by all components...`);
  }

  render() {
    return (
      <Host aria-hidden={this.hidden}>
        <ion-button
          color={this.color}
          disabled={this.disabled}
          expand={this.expand}
          fill={this.fill}
          shape={this.shape}
          size={this.size}
          strong={this.strong}
          class={this.buttonCssClass}
          onClick={this.handleClickButton.bind(this)}
        >
          <ion-icon name="return-up-back" class={this.iconCssClass}>
          </ion-icon>
          {this.label}
        </ion-button>
      </Host>
    );
  }
}

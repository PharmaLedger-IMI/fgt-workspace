import {Component, Host, h, Event, EventEmitter, Prop, Element} from '@stencil/core';
import {HostElement} from "../../decorators";

@Component({
  tag: 'status-updater-button',
  styleUrl: 'status-updater-button.css',
  shadow: false,
})
export class StatusUpdaterButton {
  @HostElement() host: HTMLElement;
  @Element() element;

  @Prop({attribute: 'status'}) status: string;
  @Prop({attribute: 'label'}) label: string = 'Show Alert';
  @Prop({attribute: 'color'}) color: string = 'primary';
  @Prop({attribute: 'disabled'}) disabled: boolean = false;
  @Prop({attribute: 'expand'}) expand: string = 'full';
  @Prop({attribute: 'fill'}) fill: string = 'solid';
  @Prop({attribute: 'size'}) size: string = 'default';
  @Prop({attribute: 'shape'}) shape: string = undefined;
  @Prop({attribute: 'button-css-class'}) buttonCssClass: string;
  @Prop({attribute: 'strong'}) strong: boolean = false;

  @Prop({attribute: 'show-add-detail'}) showAddDetail: boolean = true;
  @Prop({attribute: 'add-detail-placeholder'}) addDetailPlaceholder: string = 'Add detail (optional)'
  popupOptions = {
    inputs: [
      {name: 'notes', placeholder: this.addDetailPlaceholder}
    ]
  };

  @Event()
  clickUpdaterButton: EventEmitter;

  private handleClick(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    let data = {status: this.status };
    if (this.showAddDetail) {
      data = Object.assign(data, {popupOptions: this.popupOptions});
    }
    this.clickUpdaterButton.emit(data);
  }

  render() {
    const self = this;
    return (
      <Host>
        <ion-button
          color={this.color}
          disabled={this.disabled}
          expand={this.expand}
          fill={this.fill}
          shape={this.shape}
          size={this.size}
          strong={this.strong}
          class={this.buttonCssClass}
          onClick={self.handleClick.bind(this)}
        >
          {this.label}
        </ion-button>
      </Host>
    );
  }
}

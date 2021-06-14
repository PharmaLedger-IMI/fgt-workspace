import {Component, Host, h, Element, Prop, State} from '@stencil/core';
import {HostElement} from '../../decorators'
import {bindIonicBreakpoint, ionBreakpoints} from "../../utils/utilFunctions";

@Component({
  tag: 'list-item-layout',
  styleUrl: 'list-item-layout.css',
  shadow: false,
})
export class ListItemLayout {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Prop({attribute: "class"}) cssClass: string = "ion-margin-bottom";

  @Prop({attribute: "ajustment-class", mutable: true, reflect: true}) adjustmentClass: string = "ion-justify-content-end";

  @Prop({attribute: "lines"}) lines: 'none' | 'inset' | 'full' = "none";

  @Prop({attribute: "color"}) color: string = "light";

  @State() currentBreakpoint = ionBreakpoints.lg + '';

  // @ts-ignore
  private children;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }

  async componentDidLoad() {
    const self = this;
    this.currentBreakpoint = bindIonicBreakpoint(bp => self.currentBreakpoint = bp) + '';
    this.getSlotted();
  }

  private getSlotted(){
    let slotted = this.element.children;
    this.children = { hasChildren: slotted && slotted.length > 0, numberOfChildren: slotted && slotted.length };
  }

  private getAdjustment(){
    switch(this.currentBreakpoint + ''){
      case 'xs':
      case 'sm':
      case 'md':
        return "ion-justify-content-start ion-margin-vertical"
      case 'lg':
      case 'xl':
      default:
        return "ion-justify-content-end"
    }
  }

  render() {
    if (!this.host.isConnected)
      return;
    return (
      <Host>
        <ion-item class={`main-item${this.cssClass ? this.cssClass : ''}`} lines={this.lines} color={this.color}>
          <div slot="start">
            <slot name="start"></slot>
          </div>
          <ion-grid>
            <ion-row>
              <ion-col size="12" size-lg="5">
                <div>
                  <slot name="label"></slot>
                </div>
              </ion-col>
              <ion-col size="12" size-lg="7">
                <div class={`flex ${this.getAdjustment()}`}>
                  <slot name="content" ></slot>
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>
          <div slot="end">
            <slot name="buttons"></slot>
          </div>
        </ion-item>
      </Host>
    );
  }
}

import {Component, Host, h, Element, Prop, State, Listen} from '@stencil/core';
import {HostElement} from '../../decorators'
import {calcBreakPoint, ionBreakpoints} from "../../utils/utilFunctions";

@Component({
  tag: 'list-item-layout',
  styleUrl: 'list-item-layout.css',
  shadow: false,
})
export class ListItemLayout {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Prop({attribute: "class"}) cssClass: string = "ion-margin-bottom";

  @Prop({attribute: "orientation", mutable: true, reflect: true}) orientation: "start" | "end" = "end";

  @Prop({attribute: "lines"}) lines: 'none' | 'inset' | 'full' = "none";

  @Prop({attribute: "color"}) color: string = "light";

  @Prop({attribute: "label-col"}) labelCol: number = 4;

  @State() currentBreakpoint = ionBreakpoints.lg + '';

  // @ts-ignore
  private children;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.currentBreakpoint = calcBreakPoint();
  }

  async componentDidLoad() {
    this.getSlotted();
  }

  @Listen('resize', { target: 'window' })
  async updateOrientation(){
    this.currentBreakpoint = calcBreakPoint();
    switch(this.currentBreakpoint + ''){
      case 'xs':
      case 'sm':
      case 'md':
        this.orientation = "start";
        break;
      case 'lg':
      case 'xl':
      default:
        this.orientation = "end";
        break;
    }
  }

  private getSlotted(){
    let slotted = this.element.children;
    this.children = { hasChildren: slotted && slotted.length > 0, numberOfChildren: slotted && slotted.length };
  }

  private getAdjustment(){
    return this.orientation === "start" ? "ion-justify-content-start ion-margin-vertical" : "ion-justify-content-end";
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
              <ion-col size={this.labelCol} size-xl={this.labelCol} size-lg={this.labelCol}  size-md={this.labelCol + 3}  size-sm={Math.min(this.labelCol + 6, 10)} size-xs={10}
              style={{border: "1px solid red"}}>
                <div>
                  <slot name="label"></slot>
                </div>
              </ion-col>

              <ion-col align-self-end size={12 - this.labelCol} size-xl={12 - this.labelCol} size-lg={12 - this.labelCol} size-md={12 - this.labelCol - 3} size-sm={Math.max(12 - this.labelCol - 6, 2)} size-xs={2}
                       style={{border: "1px solid green"}}
              >
                <div class={`${this.getAdjustment()}`}>
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

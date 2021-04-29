import {Component, Host, h, Prop, Element, Event, EventEmitter, Listen, State} from '@stencil/core';
import {HostElement} from "../../decorators";


const BUTTON_TYPE = {
  MENU_BUTTON: "menu",
  TAB_BAR: "bar"
}

@Component({
  tag: 'menu-tab-button',
  styleUrl: 'menu-tab-button.css',
  shadow: false,
})
export class MenuTabButton {

  @HostElement() host: HTMLElement;

  @Element() element;

  /**
   * Through this event navigation requests to tabs are made
   */
  @Event({
    eventName: 'ssapp-navigate-tab',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendNavigateTab: EventEmitter;

  @Prop({attribute: 'icon-name', mutable: true}) iconName?: string = undefined;

  @Prop({attribute: 'label', mutable: true}) label?: string = "tab button label";

  @Prop({attribute: 'tab'}) tab: string;

  @Prop({attribute: 'mode'}) mode?: string = BUTTON_TYPE.MENU_BUTTON;

  @State() selected: boolean = false;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }

  @Listen('ionTabsWillChange', {capture: true})
  async getTabNavigationEvent(evt){
    if (this.mode !== BUTTON_TYPE.MENU_BUTTON)
      return;
    this.selected = this.tab === evt.detail;
  }

  _getIcon(){
    if (!this.iconName)
      return;
    return (
      <ion-icon class="menu-tab-button" name={this.iconName} slot="start"></ion-icon>
    )
  }

  private navigateToTab(tab: string){
    const event = this.sendNavigateTab.emit({
      tab: tab
    });
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored byt all components...`);
  }

  _getMenuMode(){
    return (
      <Host>
        <ion-item button="true" onClick={() => this.navigateToTab(this.tab)} class={this.selected ? "menu-tab-selected" : ""}>
          {this._getIcon()}
          <ion-label class="ion-padding-horizontal">{this.label}</ion-label>
        </ion-item>
      </Host>
    );
  }

  _getTabBarMode(){
    return (
      <Host>
        <ion-tab-button tab={this.tab}>
          <ion-icon name={this.iconName}></ion-icon>
          <ion-label>{this.label}</ion-label>
        </ion-tab-button>
      </Host>
    );
  }

  render() {
    if (!this.host.isConnected)
      return;
    switch(this.mode){
      case BUTTON_TYPE.MENU_BUTTON:
        return this._getMenuMode();
      case BUTTON_TYPE.TAB_BAR:
        return this._getTabBarMode();
      default:
        console.log(`Invalid menu-tab-button mode`);
    }
  }
}

import {Component, h, Prop, Element, Event, EventEmitter, Listen, State} from '@stencil/core';
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

  @Prop({attribute: 'badge', mutable: true}) badge?: number = undefined;

  /**
   * the tab name or a list of options like:
   * [
   *  {
   *    label: '...',
   *    tab: 'tab name'
   *  }
   * ]
   */
  @Prop({attribute: 'tab'}) tab: string | any;

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

  private getName(){
    return (this.label.replace(/\s/g, '') + '-popover-element').toLowerCase();
  }

  private navigateToTab(tab: string){
    const event = this.sendNavigateTab.emit({
      tab: tab
    });
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored byt all components...`);
  }

  private getBadge(slot?: string){
    if (!this.badge)
      return;
    const props = !!slot ? {slot: slot} : {};
    return (
      <ion-badge {...props}>{this.badge}</ion-badge>
    )
  }

  private async getPopOver(evt, options){
    this.definePopOverContent(options);
    const popover = Object.assign(document.createElement('ion-popover'), {
      component: this.getName(),
      cssClass: 'menu-tab-button-popover',
      translucent: true,
      event: evt,
      showBackdrop: true,
      animated: true,
      backdropDismiss: true,
    });
    document.body.appendChild(popover);
    await popover.present();

    const {role} = await popover.onWillDismiss();
    if (role && role !== 'backdrop')
      this.navigateToTab(role);
  }

  private definePopOverContent(options: [any]){
    const self = this;

    if (!!customElements.get(self.getName()))
      return;

    customElements.define(self.getName(), class extends HTMLElement{
      connectedCallback(){
        const contentEl = this;
        const getContent = function(){
          return options.map(o => `
<ion-item class="pop-over-item" tab="${o.tab}" button>
    <ion-icon slot="start" name="${o.icon}"></ion-icon>
    <ion-label class="ion-padding-horizontal">${o.label}</ion-label>
</ion-item>`).join('\n');
        }

        this.innerHTML = `
<ion-content>
  <ion-list>
    ${getContent()}
  </ion-list>
</ion-content>`;

        this.querySelectorAll('ion-item').forEach(item => {
          item.addEventListener('click', () => {
            contentEl.closest('ion-popover').dismiss(undefined, item.getAttribute('tab'));
          });
        });
      }
    });
  }

  _getMenuMode(){
    const props = !!this.selected ? {class: "tab-selected"} : {};
    const hasOptions = typeof this.tab !== 'string'
    const tabName = !hasOptions ? this.tab : this.tab.label;
    return (
        <ion-item button={true} onClick={(evt) => !hasOptions ? this.navigateToTab(tabName) : this.getPopOver(evt, this.tab)} {...props}>
          {this._getIcon()}
          <ion-label class="ion-padding-horizontal">{this.label}</ion-label>
          {this.getBadge("end")}
        </ion-item>
    );
  }

  _getTabBarMode(){
    const hasOptions = typeof this.tab !== 'string'
    const tabName = !hasOptions ? this.tab : this.tab.label;

    const props = {};
    if (hasOptions){
      props['href'] = '#';        // this makes the ion-tab-button not 'navigate'
      props['onClick'] = (evt) => this.getPopOver(evt, this.tab)
    }

    props['tab'] = tabName;

    return (
        <ion-tab-button {...props}>
          <ion-icon name={this.iconName}></ion-icon>
          <ion-label>{this.label}</ion-label>
          {this.getBadge()}
        </ion-tab-button>
    );
  }

  private testTab(){
    return !(typeof this.tab === 'string' && this.tab.startsWith('@'));

  }

  render() {
    if (!this.host.isConnected)
      return;
    if (!this.testTab())
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

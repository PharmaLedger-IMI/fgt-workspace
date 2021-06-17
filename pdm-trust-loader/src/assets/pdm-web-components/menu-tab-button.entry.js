import { r as registerInstance, e as createEvent, h, g as getElement } from './index-d0e12a29.js';
import { H as HostElement } from './index-3dd6e8f7.js';

const menuTabButtonCss = ":host{display:inherit;--ripple-color:var(--color-selected);--background-focused-opacity:1;--ion-icon-color:var(--ion-icon-color);flex:inherit;flex-direction:inherit}menu-tab-button{--menu-color:var(--ion-color-medium);--menu-color-selected:var(--ion-color-secondary);flex:1 1 0%}ion-item.pop-over-item ion-icon{color:var(--menu-color)}ion-item.nav-menu-item{--ripple-color:var(--menu-color)}ion-item.nav-menu-item.tab-selected{--ripple-color:var(--menu-color-selected)}ion-item.nav-menu-item ion-icon{color:var(--menu-color)}ion-item.nav-menu-item:hover ion-icon{color:var(--menu-color-selected)}ion-item.nav-menu-item.tab-selected ion-icon{color:var(--menu-color-selected)}ion-item.nav-menu-item ion-note.menu-text{--color:var(--menu-color)}ion-item.nav-menu-item.tab-selected ion-note.menu-text{--color:var(--menu-color-selected)}ion-item.nav-menu-item:hover ion-note.menu-text{--color:var(--menu-color-selected)}ion-icon.menu-icon{display:inline-block;vertical-align:middle}.menu-text{display:inline-block;vertical-align:middle;overflow-wrap:break-word}";

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const BUTTON_TYPE = {
  MENU_BUTTON: "menu",
  TAB_BAR: "bar"
};
const MenuTabButton = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.sendNavigateTab = createEvent(this, "ssapp-navigate-tab", 7);
    this.iconName = undefined;
    this.label = "tab button label";
    this.badge = undefined;
    this.mode = BUTTON_TYPE.MENU_BUTTON;
    this.selected = false;
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }
  async select(evt) {
    if (this.mode !== BUTTON_TYPE.MENU_BUTTON)
      return;
    this.selected = this.tab === evt.detail.tab;
  }
  _getIcon() {
    if (!this.iconName)
      return;
    return (h("ion-icon", { size: "large", class: "menu-icon", name: this.iconName }));
  }
  getName() {
    return (this.label.replace(/\s/g, '') + '-popover-element').toLowerCase();
  }
  navigateToTab(tab) {
    const event = this.sendNavigateTab.emit({
      tab: tab
    });
    if (!event.defaultPrevented)
      console.log(`Tab Navigation request seems to have been ignored byt all components...`);
  }
  getBadge(slot) {
    if (!this.badge)
      return;
    const props = !!slot ? { slot: slot } : {};
    return (h("ion-badge", Object.assign({}, props), this.badge));
  }
  async getPopOver(evt, options) {
    this.definePopOverContent(options);
    const popover = Object.assign(document.createElement('ion-popover'), {
      component: this.getName(),
      cssClass: 'menu-tab-button-popover',
      translucent: true,
      event: evt,
      showBackdrop: false,
      animated: true,
      backdropDismiss: true,
    });
    document.body.appendChild(popover);
    await popover.present();
    const { role } = await popover.onWillDismiss();
    if (role && role !== 'backdrop')
      this.navigateToTab(role);
  }
  definePopOverContent(options) {
    const self = this;
    if (!!customElements.get(self.getName()))
      return;
    customElements.define(self.getName(), class extends HTMLElement {
      connectedCallback() {
        const contentEl = this;
        const getContent = function () {
          return options.map(o => `
<ion-item lines="none" class="pop-over-item" tab="${o.tab}" button>
    <ion-icon slot="start" name="${o.icon}"></ion-icon>
    <ion-label class="ion-padding-horizontal">${o.label}</ion-label>
</ion-item>`).join('\n');
        };
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
  _getMenuMode() {
    const hasOptions = typeof this.tab !== 'string';
    const tabName = !hasOptions ? this.tab : this.tab.label;
    return (h("ion-item", { lines: "none", class: `ion-margin-bottom nav-menu-item${!!this.selected ? " tab-selected" : ''}`, button: true, onClick: (evt) => !hasOptions ? this.navigateToTab(tabName) : this.getPopOver(evt, this.tab) }, h("ion-grid", null, h("ion-row", { class: "ion-align-items-center ion-justify-content-center" }, this._getIcon()), h("ion-row", { class: "ion-align-items-center ion-justify-content-center" }, h("span", { class: "menu-text" }, h("ion-note", { class: "menu-text ion-text-center ion-text-wrap" }, this.label)))), this.getBadge()));
  }
  _getTabBarMode() {
    const hasOptions = typeof this.tab !== 'string';
    const tabName = !hasOptions ? this.tab : this.tab.label;
    const props = {};
    if (hasOptions) {
      props['href'] = '#'; // this makes the ion-tab-button not 'navigate'
      props['onClick'] = (evt) => this.getPopOver(evt, this.tab);
    }
    props['tab'] = tabName;
    return (h("ion-tab-button", Object.assign({}, props), h("ion-icon", { name: this.iconName }), h("ion-label", null, this.label), this.getBadge()));
  }
  testTab() {
    return !(typeof this.tab === 'string' && this.tab.startsWith('@'));
  }
  render() {
    if (!this.host.isConnected)
      return;
    if (!this.testTab())
      return;
    switch (this.mode) {
      case BUTTON_TYPE.MENU_BUTTON:
        return this._getMenuMode();
      case BUTTON_TYPE.TAB_BAR:
        return this._getTabBarMode();
      default:
        console.log(`Invalid menu-tab-button mode`);
    }
  }
  get element() { return getElement(this); }
};
__decorate([
  HostElement()
], MenuTabButton.prototype, "host", void 0);
MenuTabButton.style = menuTabButtonCss;

export { MenuTabButton as menu_tab_button };

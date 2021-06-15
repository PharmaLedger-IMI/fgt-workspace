import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-21b82b33.js';
import { H as HostElement } from './index-993dbba1.js';
import { i as ionBreakpoints, b as bindIonicBreakpoint } from './utilFunctions-9902702e.js';

const pdmItemOrganizerCss = ":host{display:block;--ion-margin:var(--ion-margin, 16px)}ion-popover.organizer-popover{--width:auto}ion-popover.organizer-popover ion-list>*{margin:var(--ion-margin, 16px) 0 var(--ion-margin, 16px) calc(var(--ion-margin, 16px)/2)}ion-popover.organizer-popover ul>*{margin:var(--ion-margin, 16px) 0 var(--ion-margin, 16px) calc(var(--ion-margin, 16px)/2)}pdm-item-organizer>div>*{margin-left:var(--ion-margin, 16px)}";

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
const ORGANIZER_CUSTOM_EL_NAME = "organizer-item-popover";
const PdmItemOrganizer = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.selectEvent = createEvent(this, "selectEvent", 7);
    /**
     * The number of items to display (minimum is 1), defaults to 3
     */
    this.displayCount = 3;
    /**
     * the Tag for the component to be rendered
     */
    this.componentName = undefined;
    /**
     * the list of props that will be passed to the HTML Element {@link componentName}
     */
    this.componentProps = undefined;
    /**
     * The identifying prop to be return upon click (must exist in the supplied {@link componentProps}
     */
    this.idProp = undefined;
    /**
     * The identifying prop to be return upon click (must exist in the supplied {@link componentProps}
     */
    this.cssClass = "ion-justify-content-end";
    /**
     * If the component does not generate an ion-item (so it can be handled by an ion-list)
     * this must be set to false
     */
    this.isItem = true;
    this.parsedProps = undefined;
    this.currentBreakpoint = ionBreakpoints.lg + '';
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.updateParsedProps(this.componentProps);
  }
  async componentDidLoad() {
    const self = this;
    this.currentBreakpoint = bindIonicBreakpoint(bp => self.currentBreakpoint = bp);
  }
  updateParsedProps(newProps) {
    if (!newProps)
      this.parsedProps = undefined;
    else
      try {
        this.parsedProps = JSON.parse(newProps);
      }
      catch (e) {
        console.log("could not parse props");
        this.parsedProps = undefined;
      }
  }
  definePopOverContent() {
    const self = this;
    if (!!customElements.get(ORGANIZER_CUSTOM_EL_NAME))
      return;
    customElements.define(ORGANIZER_CUSTOM_EL_NAME, class extends HTMLElement {
      connectedCallback() {
        const contentEl = this;
        const popOverElement = document.querySelector('ion-popover');
        const { displayCount, parsedProps, componentName, isItem } = popOverElement.componentProps;
        const listTag = isItem ? 'ion-list' : 'ul';
        this.innerHTML = `
<ion-content>
  <${listTag}>
    ${parsedProps.filter((props, i) => !!props && i >= displayCount)
          .map(props => self.getComponentLiteral(isItem, componentName, props)).join('')}
  </${listTag}>
</ion-content>`;
        this.querySelectorAll(componentName).forEach(item => {
          item.addEventListener('click', () => {
            contentEl.closest('ion-popover').dismiss(undefined, item.getAttribute(self.idProp));
          });
        });
      }
    });
  }
  getComponentLiteral(isItem, componentName, props) {
    const getNotIonItemListItem = function (isClose) {
      if (isItem)
        return '';
      return `<${isClose ? '/' : ''}li>`;
    };
    return `${getNotIonItemListItem()}<${componentName}${Object.keys(props).reduce((accum, prop) => {
      return accum + ` ${prop}="${props[prop]}"`;
    }, '')}></${componentName}>${getNotIonItemListItem(true)}`;
  }
  async getItemPopOver(evt) {
    this.definePopOverContent();
    const popover = Object.assign(document.createElement('ion-popover'), {
      component: ORGANIZER_CUSTOM_EL_NAME,
      cssClass: 'organizer-popover',
      translucent: true,
      event: evt,
      showBackdrop: false,
      animated: true,
      backdropDismiss: true,
      componentProps: {
        displayCount: this.displayCount,
        parsedProps: this.parsedProps,
        componentName: this.componentName,
        isItem: this.isItem
      }
    });
    document.body.appendChild(popover);
    await popover.present();
    const { role } = await popover.onWillDismiss();
    if (role && role !== 'backdrop') {
      this.selectEvent.emit(role);
    }
  }
  async showMore(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    await this.getItemPopOver(evt.detail);
  }
  triggerSelect(evt) {
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.selectEvent.emit(evt.detail);
  }
  getComponentJSX(props) {
    const self = this;
    const Tag = this.componentName;
    return (h(Tag, Object.assign({}, props, { onSelectEvent: self.triggerSelect.bind(self) })));
  }
  getFilteredComponents() {
    if (!this.parsedProps || !this.parsedProps.length)
      return [];
    if (this.parsedProps.length <= this.displayCount)
      return this.parsedProps.map(props => this.getComponentJSX(props));
    const toDisplay = Math.max(this.displayCount - 1, 1);
    const result = this.parsedProps.filter((props, i) => !!props && i <= toDisplay).map(props => this.getComponentJSX(props));
    let operation;
    switch (this.currentBreakpoint + '') {
      case 'xs':
      case 'sm':
      case 'md':
        operation = result.push.bind(result);
        break;
      case 'lg':
      case 'xl':
      default:
        operation = result.unshift.bind(result);
    }
    operation((h("more-chip", null)));
    return result;
  }
  render() {
    if (!this.host.isConnected)
      return;
    return (h(Host, null, h("div", { class: `ion-padding-horizontal flex ${this.cssClass} ion-align-items-center` }, this.getFilteredComponents())));
  }
  get element() { return getElement(this); }
  static get watchers() { return {
    "componentProps": ["updateParsedProps"]
  }; }
};
__decorate([
  HostElement()
], PdmItemOrganizer.prototype, "host", void 0);
PdmItemOrganizer.style = pdmItemOrganizerCss;

export { PdmItemOrganizer as pdm_item_organizer };

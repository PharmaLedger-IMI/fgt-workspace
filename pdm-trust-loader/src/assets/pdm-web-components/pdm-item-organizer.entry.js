import { r as registerInstance, e as createEvent, h, f as Host, g as getElement } from './index-d0e12a29.js';
import { H as HostElement } from './index-3dd6e8f7.js';

const pdmItemOrganizerCss = ":host{display:block}ion-popover.organizer-popover{--pop-over-margin:var(calc(var(--ion-margin)/2), 8px);--width:auto}ion-popover.organizer-popover ion-list>*{margin:calc(var(--pop-over-margin)/2) var(--pop-over-margin)}ion-popover.organizer-popover ul>*{margin:calc(var(--pop-over-margin)/2) var(--pop-over-margin)}pdm-item-organizer{--organizer-item-margin:var(--ion-margin, 16px)}pdm-item-organizer>div.ion-justify-content-end>*{margin-left:var(calc(var(--organizer-item-margin)/2), 8px)}pdm-item-organizer>div.ion-justify-content-start>*{margin-right:var(calc(var(--organizer-item-margin)/2), 8px)}";

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
    this.orientation = "end";
    /**
     * If the component does not generate an ion-item (so it can be handled by an ion-list)
     * this must be set to false
     */
    this.isItem = true;
    this.parsedProps = undefined;
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.updateParsedProps(this.componentProps);
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
    const operation = this.orientation === "start" ? result.push.bind(result) : result.unshift.bind(result);
    operation((h("more-chip", null)));
    return result;
  }
  render() {
    if (!this.host.isConnected)
      return;
    return (h(Host, null, h("div", { class: `ion-padding-horizontal flex ion-justify-content-${this.orientation} ion-align-items-center` }, this.getFilteredComponents())));
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

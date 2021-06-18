import {Component, Host, h, Element, Prop, Listen, Watch, State, EventEmitter, Event} from '@stencil/core';
import {HostElement} from "../../decorators";

const ORGANIZER_CUSTOM_EL_NAME = "organizer-item-popover";

@Component({
  tag: 'pdm-item-organizer',
  styleUrl: 'pdm-item-organizer.css',
  shadow: false,
})
export class PdmItemOrganizer {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Event()
  selectEvent: EventEmitter<string>

  /**
   * The number of items to display (minimum is 1), defaults to 3
   */
  @Prop({attribute: "display-count", mutable: true}) displayCount: number = 3;
  /**
   * the Tag for the component to be rendered
   */
  @Prop({attribute: "component-name", mutable: true}) componentName: string = undefined;
  /**
   * the list of props that will be passed to the HTML Element {@link componentName}
   */
  @Prop({attribute: "component-props", mutable: true}) componentProps: string = undefined;
  /**
   * The identifying prop to be return upon click (must exist in the supplied {@link componentProps}
   */
  @Prop({attribute: "id-prop"}) idProp: string = undefined;

  @Prop({attribute: "orientation", mutable: true}) orientation: "start" | "end" = "end";

  /**
   * If the component does not generate an ion-item (so it can be handled by an ion-list)
   * this must be set to false
   */
  @Prop({attribute: "is-ion-item"}) isItem: boolean = true;

  @State()
  private parsedProps: [{}] = undefined;

  async componentWillLoad(){
    if (!this.host.isConnected)
      return;
    this.updateParsedProps(this.componentProps);
  }

  @Watch("componentProps")
  updateParsedProps(newProps){
    if (!newProps)
      this.parsedProps = undefined;
    else
      try{
        this.parsedProps = JSON.parse(newProps);
      } catch (e){
        console.log("could not parse props");
        this.parsedProps = undefined;
      }
  }

  private definePopOverContent(){
    const self = this;

    if (!!customElements.get(ORGANIZER_CUSTOM_EL_NAME))
      return;

    customElements.define(ORGANIZER_CUSTOM_EL_NAME, class extends HTMLElement{
      connectedCallback(){
        const contentEl = this;
        const popOverElement: any = document.querySelector('ion-popover');
        const {displayCount, parsedProps, componentName, isItem} = popOverElement.componentProps;
        const listTag = isItem ? 'ion-list' : 'ul';
        this.innerHTML = `
<ion-content>
  <${listTag} class="organizer-pop-over-list">
    ${parsedProps.filter((props, i) => !!props && i >= displayCount)
          .map(props => self.getComponentLiteral(isItem, componentName, props)).join('')}
  </${listTag}>
</ion-content>`;

        this.querySelectorAll(componentName).forEach(item => {
          item.addEventListener('click', () => {
            const popover: any = contentEl.closest('ion-popover');
            popover.dismiss(undefined, item.getAttribute(self.idProp));
          });
        });
      }
    });
  }

  private getComponentLiteral(isItem, componentName, props){
    const getNotIonItemListItem = function(isClose?){
      if (isItem)
        return '';
      return `<${isClose ? '/' : ''}li>`
    }
    return `${getNotIonItemListItem()}<${componentName}${Object.keys(props).reduce((accum, prop) => {
      return accum + ` ${prop}="${props[prop]}"`
    }, '')}></${componentName}>${getNotIonItemListItem(true)}`;
  }

  private async getItemPopOver(evt){
    this.definePopOverContent();
    const popover: any = Object.assign(document.createElement('ion-popover'), {
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

    const {role} = await popover.onWillDismiss();
    if (role && role !== 'backdrop'){
      this.selectEvent.emit(role);
    }
  }

  @Listen('ssapp-show-more')
  async showMore(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    await this.getItemPopOver(evt.detail);
  }

  private triggerSelect(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    this.selectEvent.emit(evt.detail);
  }

  private getComponentJSX(props){
    const self = this;
    const Tag = this.componentName;
    return (<Tag {...props} onSelectEvent={self.triggerSelect.bind(self)}></Tag>)
  }

  private getFilteredComponents(){
    if (!this.parsedProps || !this.parsedProps.length)
      return [];
    if (this.parsedProps.length <= this.displayCount)
      return this.parsedProps.map(props => this.getComponentJSX(props));
    const toDisplay = Math.max(this.displayCount - 1, 1);
    const result = this.parsedProps .filter((props,i) => !!props && i <= toDisplay).map(props => this.getComponentJSX(props));

    const operation = this.orientation === "start" ? result.push.bind(result) : result.unshift.bind(result);
    operation((<more-chip></more-chip>));
    return result;
  }

  render() {
    if (!this.host.isConnected)
      return;
    return (
      <Host>
        <div class={`ion-padding-horizontal ion-justify-content-${this.orientation} ion-align-items-center`}>
          {...this.getFilteredComponents()}
        </div>
      </Host>
    );
  }
}

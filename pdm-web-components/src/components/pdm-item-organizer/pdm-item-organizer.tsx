import {Component, Host, h, Element, Prop, Listen, Watch, State} from '@stencil/core';
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
  /**
   * The Handler on the click in each item when expanded
   */
  @Prop({attribute: "click-handler"}) clickHandler: (any) => void = undefined;
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
        const listTag = self.isItem ? 'ion-list' : 'ul';
        this.innerHTML = `
<ion-content>
  <${listTag}>
    ${self.parsedProps.filter((props, i) => !!props && i >= self.displayCount)
          .map(props => self.getComponentLiteral(props)).join('')}
  </${listTag}>
</ion-content>`;

        this.querySelectorAll(self.componentName).forEach(item => {
          item.addEventListener('click', () => {
            contentEl.closest('ion-popover').dismiss(undefined, item.getAttribute(self.idProp));
          });
        });
      }
    });
  }

  private async getItemPopOver(evt){
    this.definePopOverContent();
    const popover = Object.assign(document.createElement('ion-popover'), {
      component: ORGANIZER_CUSTOM_EL_NAME,
      cssClass: 'organizer-popover',
      translucent: true,
      event: evt,
      showBackdrop: false,
      animated: true,
      backdropDismiss: true,
    });
    document.body.appendChild(popover);
    await popover.present();

    const {role} = await popover.onWillDismiss();
    if (role && role !== 'backdrop')
      if (this.clickHandler)
        this.clickHandler(role);
      else
        console.log(role);
  }

  @Listen('ssapp-show-more')
  async showMore(evt){
    evt.preventDefault();
    evt.stopImmediatePropagation();
    await this.getItemPopOver(evt.detail);
  }

  private getComponentJSX(props){
    const Tag = this.componentName;
    return (<Tag {...props}></Tag>)
  }

  private getComponentLiteral(props){
    const self = this;
    const getNotIonItemListItem = function(isClose?){
      if (self.isItem)
        return '';
      return `<${isClose ? '/' : ''}li>`
    }
    return `${getNotIonItemListItem()}<${this.componentName}${Object.keys(props).reduce((accum, prop) => {
      return accum + ` ${prop}="${props[prop]}"`
    }, '')}></${this.componentName}>${getNotIonItemListItem(true)}`;
  }

  private getFilteredComponents(){
    if (!this.parsedProps || !this.parsedProps.length)
      return [];
    if (this.parsedProps.length <= this.displayCount)
      return this.parsedProps.map(props => this.getComponentJSX(props));
    const toDisplay = Math.max(this.displayCount - 1, 1);
    const result = this.parsedProps .filter((props,i) => !!props && i <= toDisplay).map(props => this.getComponentJSX(props));
    result.unshift(<more-chip></more-chip>);
    return result;
  }

  render() {
    if (!this.host.isConnected)
      return;
    return (
      <Host>
        <div class="ion-padding-horizontal flex ion-justify-content-between ion-align-items-center">
          {...this.getFilteredComponents()}
        </div>
      </Host>
    );
  }

}

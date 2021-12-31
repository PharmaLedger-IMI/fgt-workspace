import {Component, Host, h, Element, Prop, State, Listen} from '@stencil/core';
import {HostElement} from '../../decorators'
import {calcBreakPoint} from "../../utils/utilFunctions";

@Component({
  tag: 'list-item-layout-default',
  styleUrl: 'list-item-layout-default.css',
  shadow: false,
})
export class ListItemLayoutDefault {

  @HostElement() host: HTMLElement;

  @Element() element;

  @Prop({attribute: "orientation", mutable: true, reflect: true}) orientation: "start" | "end" = "end";

  @Prop({attribute: "lines"}) lines: 'none' | 'inset' | 'full' = "none";

  // @Prop({attribute: "color"}) color: string = "light";

  @Prop({attribute: "label-col-config"}) labelConfig: string = "";
  
  @Prop({attribute: "buttons"}) buttons: boolean = false;
  @Prop({attribute: "start"}) start: boolean = false;

  @State() currentBreakpoint = calcBreakPoint();

  // @ts-ignore
  private children;

  private configL;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;

    this.currentBreakpoint = calcBreakPoint();
  }

  async componentDidLoad() {
    this.getSlotted();
  }

  @Listen('resize', { target: 'window' })
  async updateBreakPoint(){
    this.currentBreakpoint = calcBreakPoint();
  }

  private getSlotted(){
    let slotted = this.element.children;
    this.children = { hasChildren: slotted && slotted.length > 0, numberOfChildren: slotted && slotted.length };
  }

  private getLabelColAjustment(center){
      return center ? "ion-justify-content-center" : "ion-justify-content-start";
  }

  private getContentColAjustment(){
    return this.orientation === "start" ? "ion-justify-content-start" : "ion-justify-content-end ion-padding-end";
  }

  createPlaceHolders(){
    const self = this;

    let placeholderPosition = 0;
    let emptySpace = 12;
    const content = [];

    const labelKeys = Object.keys(self.configL);

    labelKeys.forEach(col => {
      content.push(self.createLabelPlaceholder(placeholderPosition, self.configL[col].sizeByScreen[self.currentBreakpoint], self.configL[col].center));
      placeholderPosition++;
    })

    labelKeys.forEach(col => {
      emptySpace -= self.configL[col].sizeByScreen[self.currentBreakpoint];
    })

    content.push(self.createContentPlaceholder(emptySpace))
    return content;
  }

  /**
   *  Functions to generate placeholders dynamically
   */

  /**
   * Creates one placeholder with the slot start
   * @returns placeholder slot start
   */
   createStartPlaceholder(){
    return(
      <div slot="start">
        <slot name="start"></slot>
      </div>
    )
  }

  /**
   * Creates multiple placeholders with the slot label(position);
   * @param {Number} placeholderPosition //Represents the position of the placeholder
   * @param {string} fixed //Represents if the placeholder will have fixed size
   * @param {Number} size //Represents the size of the col when placeholder doenst have fixed size
   * @returns placeholder slot label(N)(N represents a number);
   */
  createLabelPlaceholder(placeholderPosition, size, position){
    const placeHolderName = "label" + placeholderPosition;

    return(
      <ion-col size={size}>
        <div class={`flex ${this.getLabelColAjustment(position)}`}>
          <slot name={placeHolderName}></slot>
        </div>
      </ion-col>
    )

  }

  /**
   * Creates one placeholder with the slot content
   * @param {Number} size //Represents the size of the col of the placeholder
   * @returns placeholder slot start
   */
  createContentPlaceholder(size){
    return(
      <ion-col size={size}>
        <div class={`flex ${this.getContentColAjustment()}`}>
          <slot name="content"></slot>
        </div>
      </ion-col>
    )
  }

  /**
   * Creates one placeholder with the slot buttons
   * @returns placeholder slot buttons
   */
  createButtonPlaceholder(){
    return(
      <div class="flex ion-align-items-center" slot="end">
        <slot name="buttons"></slot>
      </div>
    )

  }

  /*
   * Functions to Render the Page acording to screen size
   */

  /**
   * Renders a small screen page or a big screen page acording to screen size
   * @returns page to render;
   */
  createPage(){
    const self = this;

    try{
      self.configL = JSON.parse(self.labelConfig);
    }catch(e){
      console.log(e);
    }

    let screenRender;

    switch(self.currentBreakpoint){
      case 'xs':
        self.orientation="start"
        screenRender = self.createSmallSizePage();
        break;
      case 'sm':
      case 'md':
        self.orientation = "end"
        screenRender = self.createSmallSizePage();
        break;
      case 'lg':
      case 'xl':
      default:
        self.orientation = "end"
        screenRender = self.createBigSizePage();
        break;
    }
      
    return screenRender;
  }

  /**
   * Returns a page for big screen sizes
   * @returns big screen size page
   */

  createBigSizePage(){
    
    return(
      // class={`main-item${this.cssClass ? this.cssClass : ''}`} color={this.color}
      <ion-item lines={this.lines}>
        {this.createStartPlaceholder()}
        <ion-grid>
          <ion-row class="ion-align-items-center">
            {this.createPlaceHolders()}
          </ion-row>
        </ion-grid>
        {this.createButtonPlaceholder()}
      </ion-item>
    )
  }

  /**
   * Returns a page for small screen sizes
   * @returns small screen size page
   */
  createSmallSizePage(){
    const self = this;

    if(self.start && self.buttons)
      return (
        <ion-list>
          <ion-item-sliding>
          {/* class={`main-item${this.cssClass ? this.cssClass : ''}`} color={this.color} */}
            <ion-item lines={this.lines}>
              <ion-grid>              
                <ion-row class="ion-align-items-center">
                  {this.createPlaceHolders()}
                </ion-row>
              </ion-grid>
            </ion-item>
            <ion-item-options side="end">
              {this.createButtonPlaceholder()}
            </ion-item-options>
            <ion-item-options side="start">
              {this.createStartPlaceholder()}
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
      )

    if(self.buttons)
      return (
        <ion-list>
          <ion-item-sliding>
          {/* class={`main-item${this.cssClass ? this.cssClass : ''}`} lines={this.lines} color={this.color} */}
            <ion-item lines={this.lines}>
              <ion-grid>
                <ion-row class="ion-align-items-center">
                  {this.createPlaceHolders()}
                </ion-row>
              </ion-grid>
            </ion-item>
            <ion-item-options side="end">
              {this.createButtonPlaceholder()}
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
      )

    if(self.start)
      return (
        <ion-list>
          <ion-item-sliding>
          {/* class={`main-item${this.cssClass ? this.cssClass : ''}`} lines={this.lines} color={this.color} */}
            <ion-item lines={this.lines}>
              <ion-grid>
                <ion-row class="ion-align-items-center">
                  {this.createPlaceHolders()}
                </ion-row>
              </ion-grid>
            </ion-item>
            <ion-item-options side="start">
              {this.createStartPlaceholder()}
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
      )


    return (
      <ion-list>
        <ion-item-sliding>
        {/* class={`main-item${this.cssClass ? this.cssClass : ''}`} lines={this.lines} color={this.color} */}
          <ion-item lines={this.lines}>
            <ion-grid>
              <ion-row class="ion-align-items-center">
                {this.createPlaceHolders()}
              </ion-row>
            </ion-grid>
          </ion-item>
        </ion-item-sliding>
      </ion-list>
    )
  }

  render() {
    if (!this.host.isConnected)
      return;
    return (
      <Host>
        {this.createPage()}
      </Host>
    );
  }
}

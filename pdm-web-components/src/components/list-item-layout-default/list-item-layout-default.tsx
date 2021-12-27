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

  // @Prop({attribute: "class"}) cssClass: string = "ion-margin-bottom";

  // @Prop({attribute: "orientation", mutable: true, reflect: true}) orientation: "start" | "end" = "end";

  // @Prop({attribute: "lines"}) lines: 'none' | 'inset' | 'full' = "none";

  // @Prop({attribute: "color"}) color: string = "light";

  @Prop({attribute: "label-col-config"}) labelConfig: string = "";
  // @Prop({attribute: "content-col-config"}) contentConfig: string = "";
  
  @Prop({attribute: "buttons"}) buttons: boolean = false;
  @Prop({attribute: "start"}) start: boolean = false;

  @State() currentBreakpoint = calcBreakPoint();

  // @ts-ignore
  private children;

  private configL;
  // private configC;

  // private fixedSizeOrientation = "start";

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

  // private getAdjustment(){
  //   return this.orientation === "start" ? "ion-justify-content-start" : "ion-justify-content-end";
  // }

  // private getLabelColAjustment(isBadge){
  //     return isBadge ? "ion-justify-content-center ion-margin-vertical" : "ion-justify-content-start ion-margin-vertical";
  // }

  // private getContentColAjustment(isItemOrganizer){
  //   if(!isItemOrganizer)
  //     return this.orientation === "start" ? "ion-justify-content-start ion-margin-vertical" : "ion-justify-content-end ion-margin-vertical";

  //   return this.orientation === "start" ? "ion-justify-content-start" : "ion-justify-content-end";
  // }

  createPlaceHolders(){
    const self = this;

    let placeholderPosition = 0;
    let emptySpace = 12;
    const content = [];

    const labelKeys = Object.keys(self.configL);

    labelKeys.forEach(col => {
      content.push(self.createLabelPlaceholder(placeholderPosition, self.configL[col].sizeByScreen[self.currentBreakpoint]));
      placeholderPosition++;
    })

    labelKeys.forEach(col => {
      emptySpace -= self.configL[col].sizeByScreen[self.currentBreakpoint];
    })

    console.log("Empty Spaces = ", emptySpace);
    console.log("BreakPoint =", self.currentBreakpoint)

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
  createLabelPlaceholder(placeholderPosition, size){
    const placeHolderName = "label" + placeholderPosition;

    return(
      <ion-col size={size}>
         {/* class="flex ion-justify-content-center" */}
        <div>
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
        {/* class="flex ion-align-items-center" */}
        <div>
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
      // class={`flex ion-justify-content-center ion-margin-vertical`}
      <div  slot="end">
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
      case 'sm':
      case 'md':
        screenRender = self.createSmallSizePage();
        break;
      case 'lg':
      case 'xl':
      default:
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
      // class={`main-item${this.cssClass ? this.cssClass : ''}`} lines={this.lines} color={this.color}
      <ion-item >
        {this.createStartPlaceholder()}
        <ion-grid>
        {/* class="ion-align-items-center" */}
          <ion-row>
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
          {/* class={`main-item${this.cssClass ? this.cssClass : ''}`} lines={this.lines} color={this.color} */}
            <ion-item >
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
            <ion-item >
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
            <ion-item >
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
          <ion-item >
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

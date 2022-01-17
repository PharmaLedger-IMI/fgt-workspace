import { Component, Method, State, Host, h, Listen, ComponentInterface, Prop, EventEmitter, Event } from "@stencil/core"
import { calcBreakPoint } from "../../utils/utilFunctions"
import {WebManager, WebManagerService} from '../../services/WebManagerService';


// // import {HostElement} from '../../decorators'
// // import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
// // import { Element, Watch} from "@stencil/core";



@Component({
  tag: 'pdm-ion-content-display',
  styleUrl: 'pdm-ion-content-display.css',
  shadow: false,
})
export class PdmIonContentDisplay implements ComponentInterface{

  /**
   * Through this event errors are passed
   */

  @Event({
    eventName: 'ssapp-send-error',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendErrorEvent: EventEmitter;

  private sendError(message: string, err?: object){
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`ION-CONTENT-DISPLAY ERROR: ${message}`, err);
  }

  /**
   * Content Header Graphical Params
   */

  @Prop({attribute: 'content-title'}) contentTitle = 'PDM Ionic Content';
  @Prop({attribute: 'icon-name'}) iconName?: string = "albums";
  @Prop({attribute: 'has-button'}) hasButton?: boolean = false;
  
  /**
   * Shows the search bar or not.
   */
  @Prop({attribute: 'can-query'}) canQuery?: boolean = true;
  @Prop({attribute: 'searchbar-placeholder', mutable: true}) placeholder: string = 'enters search terms...'

  /**
   * Content Component Setup
   */

  /**
   * sets the name of the manager to use
   */
  @Prop() manager?: string;




  @State() currentBreakPoint: string = undefined;
  @State() showSearch: boolean = false;

  private webManager: WebManager = undefined;

  @Method()
  async refresh(){
    const self = this;

    await self.loadContents();

    self.currentBreakPoint = calcBreakPoint();
  }

  @Listen('resize', { target: 'window' })
  async updateScreenSize(){
    const self = this;

    if(self.currentBreakPoint !== calcBreakPoint())
      self.refresh();
  }

  /**
   * Content Display Render
   */

  async loadContents(){
  // async loadContents(pageNumber?: number){
    const self = this;

    self.webManager = self.webManager || await WebManagerService.getWebManager(self.manager);
    
    if(!self.webManager)
      return;

        //   if (this.paginated){
  //     await this.webManager.getPage(this.itemsPerPage, pageNumber || this.currentPage, this.query, this.sort, false, (err, contents) => {
  //       if (err){
  //         this.sendError(`Could not list items`, err);
  //         return;
  //       }
  //       this.currentPage = contents.currentPage;
  //       this.pageCount = contents.totalPages;
  //       this.updateTable(contents.items);
  //     });
  //   } else {

    await self.webManager.getAll(false, undefined,(err, contents) => {
      if(err){
        self.sendError(`Could not list items`, err);
        return;
      }

      console.log('## contents: ', contents)
       //       this.updateTable(contents);
    })
  }
  


  /**
   * Content Header Render
   */
  private getSearchButton(){
    const self = this;

    if(!self.canQuery)
      return;

    if(self.showSearch)
      return(
        <ion-button class={self.hasButton ? "ion-margin-end" : ""} color="secondary" fill="clear" onClick={() => {
          self.showSearch = false;
        }}>
          <ion-icon slot="icon-only" name="close-circle-outline"></ion-icon>
        </ion-button>
      )

    return(
      <ion-button class={self.hasButton ? "ion-margin-end" : ""} fill="solid" color="secondary" onClick={() => {
        self.showSearch = true;
      }}>
        <ion-icon  slot="icon-only" name="search-outline"></ion-icon>
      </ion-button>
    )
  }

  private getSearchBar(searchBarType){
    const self = this;

    if(!self.canQuery)
      return;


//       return (
//         <div class="ion-margin-end">
//           <pdm-search-bar onSearch={self.performSearch.bind(self)} placeholder={self.searchBarPlaceholder}> </pdm-search-bar>
//         </div>
//       )
//     }


//       //Falta para ecras pequenos
//       return(
//         <pdm-ion-grid-search-bar 

//         > 
//         </pdm-ion-grid-search-bar>
//       )
//     }

//       //Falta para ecras pequenos
//     return(
//       <pdm-ion-grid-search-bar 
//         onSearch={self.performSearch.bind(self)} 
//         placeholder={self.searchBarPlaceholder}
//       > 
//       </pdm-ion-grid-search-bar>
//     )
//   }

    return(
      <pdm-ion-grid-search-bar
      placeholder={self.placeholder}
      search-bar-type={searchBarType}
      >
      </pdm-ion-grid-search-bar>
    )
  }

  private getContentHeaderSmallScreens(){
    const self = this;

    if(self.showSearch)
      return(
        <ion-grid>
          <ion-row class="ion-align-items-center ion-padding-horizontal ion-margin-vertical">
            <ion-col size="auto">
              <ion-icon size="large" color="secondary" name={self.iconName}></ion-icon>
            </ion-col>
            <ion-col size="auto">
              <ion-label class="ion-text-uppercase ion-padding-start" color="secondary">{self.contentTitle}</ion-label>
            </ion-col>
            <ion-col></ion-col>
            <ion-col size="auto">
              {self.getSearchButton()}
            </ion-col>
            <ion-col size="auto">
              <ion-buttons>
                <slot name="buttons"></slot>
              </ion-buttons>
            </ion-col>
          </ion-row>
          <ion-row class="ion-align-items-center ion-margin-vertical">
            <ion-col size="12">
              {self.getSearchBar("full")}
            </ion-col>
          </ion-row>
        </ion-grid>

      )

    return(
      <ion-grid>
        <ion-row class="ion-align-items-center ion-padding-horizontal ion-margin-vertical">
          <ion-col size="auto">
            <ion-icon size="large" color="secondary" name={self.iconName}></ion-icon>
          </ion-col>
          <ion-col size="auto">
            <ion-label class="ion-text-uppercase ion-padding-start" color="secondary">{self.contentTitle}</ion-label>
          </ion-col>
          <ion-col></ion-col>
          <ion-col size="auto">
            {self.getSearchButton()}
          </ion-col>
          <ion-col size="auto">
            <ion-buttons>
              <slot name="buttons"></slot>
            </ion-buttons>
          </ion-col>
        </ion-row>
      </ion-grid>
    )
  }

  private getContentHeaderBigScreens(){
    const self = this;

    return(
      <ion-grid>
        <ion-row class="ion-align-items-center ion-padding-horizontal ion-margin-vertical">
          <ion-col size="auto">
            <ion-icon size="large" color="secondary" name={self.iconName}></ion-icon>
          </ion-col>
          <ion-col size="auto">
            <ion-label class="ion-text-uppercase ion-padding-start" color="secondary">{self.contentTitle}</ion-label>
          </ion-col>
          <ion-col></ion-col>
          <ion-col size="auto">
            {self.getSearchBar("default")}
          </ion-col>
          <ion-col size="auto">
            <ion-buttons>
              <slot name="buttons"></slot>
            </ion-buttons>
          </ion-col>
        </ion-row>
      </ion-grid>
    )
  }

  getContentHeader(){
    const self = this;

    console.log('### BreakPoint: ', self.currentBreakPoint)

    switch(self.currentBreakPoint){
      case 'xs':
      case 'sm':
      case 'md':
        return self.getContentHeaderSmallScreens();
      case 'lg':
      case 'xl': 
        self.showSearch = false;
        return self.getContentHeaderBigScreens();
      default:
        return;
      }
  }

  /**
   * Component Render
   */  

  render(){
    const self = this;
  
    return(
      <Host>
        {self.getContentHeader()}
         
          {/* id="ion-table-content" class="ion-padding" */}
          {/* {self.getContent()} */}
        {/* {this.getPagination()} } */}
      </Host>
    )
  
  }
}




//   /*
//    * Content Graphical Params
//    */
//   @Prop({attribute: 'content-type'}) contentType?: 'grid' | 'table' | 'list' = 'grid';
//   @Prop({attribute: 'no-content-message', mutable: true}) noContentMessage?: string = "NO RESULTS FOUND";
//   @Prop({attribute: 'paginated', mutable: true}) paginated?: boolean = true;
//   @Prop({attribute: 'items-per-page', mutable: true}) itemsPerPage?: number = 10;

//   /**
//    * Content Component Setup Params
//    */


//   /**
//    * The tag for the item type that the table should use eg: 'li' would create list items
//    */
//   @Prop({attribute: 'item-type'}) itemType: string;
  
//   /**
//    * Option props to be passed to child elements in from a JSON object in value key format only format
//    */
//   @Prop({attribute: 'item-props', mutable:true}) itemProps?: any = undefined;
 
//   /**
//    * the querying attribute name so the items can query their own value
//    */
//   @Prop({attribute: 'item-reference'}) itemReference: string;

//   @Prop({attribute: 'query', mutable: true}) query?: string = undefined;

  


//   @Method()
//   async refresh(){
//       // await this.loadContents();
//   }

//   /**
//    * Search Bar
//    */

//   async performSearch(evt: any) {
//     const self = this;

//     console.log(`# ${self.manager} search keyword=${evt.detail}`)
//     self.query = evt.detail;
//   }

//   /*
//    * Content Header Render
//    */ 



//   /**
//    * Content Render  
//    */
//   private getContentPdmGrid(){
//     const self = this;

//     return(
//       <pdm-ion-grid
//       no-content-message={self.noContentMessage}
//       item-type={self.itemType}
//       item-reference={self.itemReference}
//       item-props={self.itemProps}
//       is-paginated={self.paginated}
//       items-per-page={self.itemsPerPage}
//       content-manager={self.manager}
//       break-point={self.currentBreakpoint}
//       query={self.query}
//       >
//       </pdm-ion-grid>
//     )

//   }

//   getContent(){
//     const self = this;

//     switch(self.contentType){
//       case 'grid':
//         return self.getContentPdmGrid();
//       case 'table':
//       case 'list':
//       default:
//         return self.getContentPdmGrid();
//     }
//   }



// }










//   @HostElement() host: HTMLElement;

//   @Element() element;



//   /**
//    * Graphical Params
//    */



//   @Prop({attribute: 'loading-message', mutable: true}) loadingMessage?: string = "Loading...";









//   /**
//    * the querying attribute name so the items can query their own value
//    */
//   @Prop({attribute: 'auto-load'}) autoLoad: boolean = false;

//   /**
//    * Querying/paginating Params - only available when mode is set by ref
//    */

//   
//   @Prop({attribute: 'page-count', mutable: true}) pageCount?: number = 0;
//   
//   @Prop({attribute: 'current-page', mutable: true}) currentPage?: number = 0;
//   @Prop({mutable: true}) sort?: string = undefined;

//   private webManager: WebManager = undefined;

//   @State() model = undefined;








//   @Watch('query')
//   async _updateByQuery(newQuery: string, oldQuery:string){
//     if (!this.host || !this.host.isConnected) // For WebCardinal Compatibility, otherwise it would trigger when they changed the value initially
//       return

//     if (!newQuery && !oldQuery)
//       return;
//     if (newQuery === oldQuery)
//       return;
//     this.model = undefined;
//     await this.refresh();
//   }








//   async componentWillLoad() {
//     if (!this.host.isConnected)
//       return;
//     if (this.autoLoad)
//       await this.loadContents();
//   }














// import {WebManager, WebManagerService} from '../../services/WebManagerService';
// import {HostElement} from '../../decorators'
// import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
// import {Component, ComponentInterface, EventEmitter, h, Host, Prop, Element, Event, State, Watch, Method} from "@stencil/core";


//   @HostElement() host: HTMLElement;

//   @Element() element;



//   /**
//    * Graphical Params
//    */

//   @Prop({attribute: 'no-content-message', mutable: true}) noContentMessage?: string = "No Content";
//   @Prop({attribute: 'loading-message', mutable: true}) loadingMessage?: string = "Loading...";


//   /**
//    * Component Setup Params
//    */


//   /**
//    * sets the name of the manager to use
//    */
//   @Prop() manager?: string;
//   /**
//    * The tag for the item type that the table should use eg: 'li' would create list items
//    */
//   @Prop({attribute: 'item-type'}) itemType: string;
//   /**
//    * Option props to be passed to child elements in from a JSON object in value key format only format
//    */
//   @Prop({attribute: 'item-props', mutable:true}) itemProps?: any = undefined;

//   /**
//    * the querying attribute name so the items can query their own value
//    */
//   @Prop({attribute: 'item-reference'}) itemReference: string;
//   /**
//    * the querying attribute name so the items can query their own value
//    */
//   @Prop({attribute: 'auto-load'}) autoLoad: boolean = false;

//   /**
//    * Querying/paginating Params - only available when mode is set by ref
//    */
//   @Prop({attribute: 'query', mutable: true}) query?: string = undefined;
//   @Prop({attribute: 'paginated', mutable: true}) paginated?: boolean = true;
//   @Prop({attribute: 'page-count', mutable: true}) pageCount?: number = 0;
//   @Prop({attribute: 'items-per-page', mutable: true}) itemsPerPage?: number = 10;
//   @Prop({attribute: 'current-page', mutable: true}) currentPage?: number = 0;
//   @Prop({mutable: true}) sort?: string = undefined;



//   @State() model = undefined;

//   private updateTable(newModel){
//     if (!this.model){
//       this.model = [...newModel];
//       return;
//     }
//     const model = this.model;
//     const equals = [];
//     newModel.forEach((m,i) => {
//       if (m === model[i])
//         equals.push(i);
//     });

//     this.model = [...newModel];

//     this.element.querySelectorAll(`div[id="ion-table-content"] > *`).forEach(async (e,i) => {
//       if (equals.indexOf(i) !== -1)
//         if (e.refresh)
//           await e.refresh();
//     });
//   }

//   async performSearch(evt: any) {
//     console.log(`# ${this.manager} search keyword=${evt.detail}`)
//     this.query = evt.detail;
//   }



//   @Watch('query')
//   async _updateByQuery(newQuery: string, oldQuery:string){
//     if (!this.host || !this.host.isConnected) // For WebCardinal Compatibility, otherwise it would trigger when they changed the value initially
//       return

//     if (!newQuery && !oldQuery)
//       return;
//     if (newQuery === oldQuery)
//       return;
//     this.model = undefined;
//     await this.refresh();
//   }

//   @Method()
//   async refresh(){
//     await this.loadContents();
//   }

//   private async changePage(offset: number){
//     if (this.currentPage + offset > 0 || this.currentPage + offset <= this.pageCount){
//       this.model = undefined;
//       await this.loadContents(this.currentPage + offset);
//     }
//   }

//   private getEmptyContent(){
//     // @ts-ignore
//     return (
//       <ion-grid>
//         <ion-row class="ion-justify-content-center">
//           <ion-col size="4" class="ion-justify-content-center">
//               <ion-button slot="start" fill="clear" onClick={() => this.refresh()}>
//                 <ion-icon slot="icon-only" name="refresh"></ion-icon>
//               </ion-button>
//               <ion-label class="text-align-center">
//                 {this.noContentMessage}
//               </ion-label>
//           </ion-col>
//         </ion-row>
//       </ion-grid>
//     )
//   }

//   private getLoadingContent(){
//     return (
//       <ion-grid>
//         <ion-row class="ion-justify-content-center">
//           <ion-col size="5" class="ion-justify-content-center">
//               <multi-spinner type={SUPPORTED_LOADERS.circles}></multi-spinner>
//           </ion-col>
//         </ion-row>
//       </ion-grid>
//     )
//   }

//   private getItem(reference){
//     const Tag = this.itemType;
//     let props = {};
//     props[this.itemReference] = reference;

//     if (!!this.itemProps){
//       this.itemProps.split(';').forEach(ip => {
//         const keyValue = ip.split(':');
//         props[keyValue[0]] = keyValue[1];
//       });
//     }

//     return (<Tag {...props}></Tag>);
//   }

//   private getContent(){
//     if (!this.model)
//       return this.getLoadingContent();
//     const content = [];

//     if (!this.model.length)
//       return this.getEmptyContent();
//     this.model.forEach(reference => {
//       content.push(this.getItem(reference));
//     });

//     return content;
//   }



//   getPagination(){
//     if (!this.paginated)
//       return;
//     return (
//       <ion-row class="ion-justify-content-center ion-align-items-center">
//         <ion-buttons>
//           <ion-button fill="clear" size="small" color="medium" onClick={() => this.changePage(-1)} disabled={this.currentPage <= 1}>
//             <ion-icon slot="icon-only" name="chevron-back-circle-outline"></ion-icon>
//           </ion-button>
//           <ion-label color="medium" >{this.currentPage}/{this.pageCount}</ion-label>
//           <ion-button fill="clear" size="small" color="medium"  onClick={() => this.changePage(1)} disabled={!(this.currentPage < this.pageCount)}>
//             <ion-icon slot="icon-only" name="chevron-forward-circle-outline"></ion-icon>
//           </ion-button>
//         </ion-buttons>
//       </ion-row>
//     )
//   };

//   async componentWillLoad() {
//     if (!this.host.isConnected)
//       return;
//     if (this.autoLoad)
//       await this.loadContents();
//   }





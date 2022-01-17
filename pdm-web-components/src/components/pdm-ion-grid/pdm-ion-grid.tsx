import { Component, ComponentInterface, Host, h, Prop} from "@stencil/core"

// import { State, Prop, Event, EventEmitter, Element, Watch } from "@stencil/core";
// import { WebManagerService, WebManager } from "../../services/WebManagerService";
// import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
// import {HostElement} from '../../decorators'

// // import { ComponentInterface} from "@stencil/core";

@Component({
  tag: 'pdm-ion-grid',
  styleUrl: 'pdm-ion-grid.css',
  shadow: false
})
export class PdmIonGrid implements ComponentInterface{

  @Prop({attribute: 'reference-list'}) referenceList?: string[] = [];

  getContent(){
    console.log('check out new model: ', this.referenceList);
  }


  render() {
    const self = this;

    return(
      <Host>
        <ion-grid>
          {self.getContent()}
        </ion-grid>
      </Host>
    )
      
//   render(){
//     const self = this;

//     return (
//       <Host>
//         <ion-grid class="ion-padding">
//         {self.getContent()}
//         </ion-grid>
//         {self.getPagination()}
//       </Host>
//     )
//   }
  }
}



//   @HostElement() host: HTMLElement;

//   @Element() element;

//   /**
//    * Through this event errors are passed
//    */
//   @Event({
//       eventName: 'ssapp-send-error',
//       bubbles: true,
//       composed: true,
//       cancelable: true,
//     })
//     sendErrorEvent: EventEmitter;

//   private sendError(message: string, err?: object){
//     const event = this.sendErrorEvent.emit(message);
//     if (!event.defaultPrevented || err)
//       console.log(`ION-GRID ERROR: ${message}`, err);
//   }

//   /**
//    * Content Graphical Params
//    */
//   @Prop({attribute: 'no-content-message', mutable: true}) noContentMessage?: string = "NO RESULTS FOUND";
//   @Prop({attribute: 'break-point'}) currentBreakPoint?: string = "lg"

//   /**
//    * Content Component Setup Params
//    */
  
//   /**
//    * sets the name of the manager to use
//    */
//   @Prop({attribute: 'content-manager'}) manager?: string;
  
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
//    * Pagination Graphical Params
//    */
//   @Prop({attribute: 'current-page', mutable: true}) currentPage?: number = 0;
//   @Prop({attribute: 'page-count', mutable: true}) pageCount?: number = 0;
//   @Prop({attribute: 'is-paginated', mutable: true}) paginated?: boolean = true;
//   @Prop({attribute: 'items-per-page', mutable: true}) itemsPerPage?: number = 10;

//   /**
//    * Query Params
//    */
//   @Prop({attribute: 'query', mutable: true}) query?: string = undefined;
//   @Prop({mutable: true}) sort?: string = undefined;
//   /**
//    * the querying attribute name so the items can query their own value
//    */
//   @Prop({attribute: 'auto-load'}) autoLoad: boolean = false;

//   /**
//    * Internal State Component Setup
//    */
//   @State() model = undefined;

//   private webManager: WebManager = undefined;

//   /**
//    * Component Life Cicle
//    */
//   @Watch('query')
//    async _updateByQuery(newQuery: string, oldQuery:string){
//     if (!this.host || !this.host.isConnected) // For WebCardinal Compatibility, otherwise it would trigger when they changed the value initially
//      return
 
//     if (!newQuery && !oldQuery)
//      return;
    
//      if (newQuery === oldQuery)
//       return;
//     this.model = undefined;
//     await this.refresh();
//   }

//   async componentWillLoad() {
//     const self = this;
//     if (!self.host.isConnected)
//       return;
//     if (self.autoLoad)
//       await self.loadContents();
//   }

//   async refresh(){
//     const self = this;
//     await self.loadContents();
//   }

//   /**
//    * Pagination render
//    */

//   private async changePage(offset: number){
//     const self = this;

//     if(self.currentPage + offset > 0 || self.currentPage + offset <= self.pageCount){
//       self.model = undefined;
//       await self.loadContents(self.currentPage + offset);
//     }
//   }

//   getPagination(){
//     const self = this;

//     if(!self.paginated)
//       return;

//     return(
//       <ion-grid>
//         <ion-row class="ion-justify-content-center ion-align-items-center">
//           <ion-buttons>
//             <ion-button fill="clear" size="small" color="medium" onClick={() => self.changePage(-1)} disabled={self.currentPage <= 1}>
//               <ion-icon slot="icon-only" name="chevron-back-circle-outline"></ion-icon>
//             </ion-button>
//             <ion-label color="medium">{self.currentPage}/{self.pageCount}</ion-label>
//             <ion-button fill="clear" size="small" color="medium" onClick={() => {self.changePage(1)}} disabled={self.currentPage >= self.pageCount}>
//               <ion-icon slot="icon-only" name="chevron-forward-circle-outline"></ion-icon>
//             </ion-button>
//           </ion-buttons>
//         </ion-row>
//       </ion-grid>
//     )
//   }

//   /**
//    * Content Render
//    */

//   private updateGrid(newModel){
//     const self = this;

//     if(!self.model){
//       self.model = [...newModel];
//       return;
//     }

//     const model = self.model;
//     const equals = [];

//     newModel.forEach((m,i) => {
//       if(m === model[i])
//         equals.push(i);
//     });

//     self.model = [...newModel];

//     // self.element.querySelectorAll(`ion-grid[id="ion-grid-content" > *]`).forEach(async (e,i) => {
//     //   if(equals.indexOf(i) !== -1)
//     //     if(e.refresh)
//     //       await e.refresh();
//     // })

//   }

//   async loadContents(pageNumber?: number){
//     const self = this;

//     self.webManager = self.webManager || await WebManagerService.getWebManager(self.manager);

//     if(!self.webManager)
//       return;

//     if(self.paginated){
//       await self.webManager.getPage(self.itemsPerPage, pageNumber || self.currentPage, self.query, self.sort, false,(err, contents) =>{
//         if(err){
//           self.sendError(`Could not list items`, err);
//           return;
//         }
//         self.currentPage = contents.currentPage;
//         self.pageCount = contents.totalPages;
//         self.updateGrid(contents.items);
//       })
//     } else {
//       await self.webManager.getAll(false, undefined, (err, contents) => {
//         if(err){
//           self.sendError(`Could not list items`, err);
//           return;
//         }
//         self.updateGrid(contents);
//       })
//     }

//   }

//   private getItem(reference){
//     const self = this;

//     const Tag = self.itemType;
//     let props = {};

//     props[self.itemReference] = reference;

//     if(!!self.itemProps){
//       self.itemProps.split(';').forEach(ip =>{
//         const keyValue=ip.split(':');
//         props[keyValue[0]] = keyValue[1];
//       })
//     }

//     return(<Tag {...props}></Tag>);
//   }

//   private getEmptyContent(){
//       const self = this;

//       return[
//         <ion-row class="ion-align-items-center">
//           <ion-col></ion-col>
//           <ion-col size="auto" class="ion-justify-content-center">
//             <ion-icon color="medium" size="large" name="albums"></ion-icon>
//           </ion-col>
//           <ion-col></ion-col>
//         </ion-row>,
//         <ion-row class="ion-align-items-center">
//           <ion-col></ion-col>
//           <ion-col size="auto" class="ion-justify-content-center">
//             <ion-label class="ion-justify-content-center" color="secondary">{self.noContentMessage}</ion-label>
//           </ion-col>
//           <ion-col></ion-col>
//         </ion-row>
//       ]
//   }

//   private getLoadingContent(){
//     return(
//       <ion-row class="ion-align-items-center">
//         <ion-col class="ion-justify-content-center">
//             <multi-spinner type={SUPPORTED_LOADERS.circles}></multi-spinner>
//         </ion-col>
//       </ion-row>
//     )
//   }

//   async getContent(){
//     const self = this;

//     await self.loadContents();

//     if(!self.model)
//       return self.getLoadingContent();
    
//     const content = [];
    
//     if(!self.model.length)
//       return self.getEmptyContent();
    
//     self.model.forEach(reference => {
//       content.push(self.getItem(reference));
//     })

//     return content;
//   }

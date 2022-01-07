import { Component, Host, h, Prop} from '@stencil/core'
// import {Component, Element, Event, EventEmitter, h, Host, Prop} from '@stencil/core';
// import {HostElement} from "../../decorators";


  @Component({
    tag: 'pdm-ion-grid-search-bar',
    styleUrl: 'pdm-ion-grid-search-bar.css',
    shadow: false,

  })
  export class PdmIonGridSearchBar{

    @Prop({attribute: 'placeholder'}) placeholder: string = 'Search'
    @Prop({attribute: 'search-bar-type'}) searchBarType: 'default' | 'full' = 'default'

    private getDefaultSearchBar(){
      const self = this;
      return(
        <ion-item lines="none">
          <ion-searchbar
            id="search-bar"
            debounce="1000"
            search-icon="undefined"
            placeholder={self.placeholder}
          
          >
          </ion-searchbar>
          {/* onClick={self.searchEvt.bind(self)} */}
          <ion-button size="default" color="secondary" slot="end">
            <ion-icon name="search-outline"></ion-icon>
          </ion-button>
        </ion-item>
      )
    }

    private getFullSearchBar(){
      const self = this;
      return(
        <ion-item lines="none">
          <ion-searchbar
            id="search-bar"
            debounce="1000"
            search-icon="undefined"
            placeholder={self.placeholder}
          
          >
          </ion-searchbar>
          {/* onClick={self.searchEvt.bind(self)} */}
          <ion-button size="default" expand="block" color="secondary" slot="end">
            Search
          </ion-button>
        </ion-item>
      )
    }

    getSearchBar(){
      const self = this;
      
      if(self.searchBarType === "full")
        return self.getFullSearchBar();

      return self.getDefaultSearchBar();
    }

    render(){
      const self = this;

      return(
        <Host>
          {self.getSearchBar()}
        </Host>
      )
    }

  }


//   @HostElement() host: HTMLElement;
//   @Element() element;

//   @Prop({attribute: 'btn-label'}) btnLabel: string = 'Search'

//   @Event()
//   search: EventEmitter;

//   searchEvt() {
//     const el = this.element.querySelector('#search-bar')
//     this.search.emit(el.value)
//   }


// import{Component, Host, h, Prop, Element, Event, EventEmitter} from '@stencil/core'
// import {HostElement} from "../../decorators";



//     @HostElement() host: HTMLElement;

//     @Element() element;

//     @Prop({attribute: 'placeholder'}) placeholder: string = 'enter search terms...'
//     @Prop({attribute: 'btn-label'}) btnLabel: string = 'Search'
//     

//     @Event()
//     search: EventEmitter;
  
//     searchEvt() {
//       const el = this.element.querySelector('#search-bar')
//       this.search.emit(el.value)
//     }

//     getSearchBar(){
//       const self = this;

//       switch(self.searchBarType){
//         case 'default':
//         case 'full':
//         default:
//             return self.getDefaultSearchBar();
//       }
//     }

//     getDefaultSearchBar(){
//       const self = this;

//       return(
        // <ion-item>
        //   <ion-searchbar
        //   id="search-bar"
        //   debounce={1000}
        //   placeholder={self.placeholder}
        //   search-icon="undefined"
        //   enterkeyhint="enter"
        //   >
        //   </ion-searchbar>
        //   <ion-button size="default" color="secondary">
        //     <ion-icon name="search-outline"> </ion-icon>
        //   </ion-button>
        // </ion-item>
//       )
//     }

//     render(){
//       const self = this;

//       return(
//         <Host>
//           {self.getSearchBar()}
//         </Host>
//       )
//     }

//   }


// import {Component, Element, Event, EventEmitter, h, Host, Prop} from '@stencil/core';
// import {HostElement} from "../../decorators";

// @Component({
//   tag: 'pdm-search-bar',
//   styleUrl: 'pdm-search-bar.css',
//   shadow: false,
// })
// export class PdmSearchBar {

//   @HostElement() host: HTMLElement;
//   @Element() element;
//   @Prop({attribute: 'placeholder'}) placeholder: string = 'enter search terms...'
//   @Prop({attribute: 'btn-label'}) btnLabel: string = 'Search'

//   @Event()
//   search: EventEmitter;

//   searchEvt() {
//     const el = this.element.querySelector('#search-bar')
//     this.search.emit(el.value)
//   }


import {Component, Element, Event, EventEmitter, h, Host, Prop} from '@stencil/core';
import {HostElement} from "../../decorators";

@Component({
  tag: 'pdm-search-bar',
  styleUrl: 'pdm-search-bar.css',
  shadow: false,
})
export class PdmSearchBar {

  @HostElement() host: HTMLElement;
  @Element() element;
  @Prop({attribute: 'placeholder'}) placeholder: string = 'enter search terms...'
  @Prop({attribute: 'btn-label'}) btnLabel: string = 'Search'

  @Event()
  search: EventEmitter;

  searchEvt() {
    const el = this.element.querySelector('#search-bar')
    this.search.emit(el.value)
  }

  render() {
    const self = this;
    return (
      <Host>
        <ion-grid>
          <ion-row className="ion-justify-content-center ion-align-items-center">
            <ion-col size="auto" className="ion-align-self-center">
              <ion-searchbar
                id="search-bar"
                debounce={1000}
                placeholder={self.placeholder}
                search-icon="search-outline">
              </ion-searchbar>
            </ion-col>
            <ion-col className="ion-align-self-center">
              <ion-button style={{padding: '3px 0'}} color="secondary" expand="full"
                          onClick={self.searchEvt.bind(self)}>{self.btnLabel}
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </Host>
    );
  }
}

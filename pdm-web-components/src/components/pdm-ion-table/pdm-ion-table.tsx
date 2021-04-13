import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Method,
  Prop,
  State,
  Watch
} from '@stencil/core';

import {WebManager, WebManagerService} from '../../services/WebManagerService';
import {applyChain, extractChain, promisifyEventEmit} from "../../utils";
import {HostElement} from '../../decorators'

@Component({
  tag: 'pdm-ion-table',
  styleUrl: 'pdm-ion-table.css',
  shadow: false,
})
export class PdmIonTable implements ComponentInterface {
  @HostElement() host: HTMLElement;

  @Element() element;

  /**
   * Through this event model is received (from webc-container, webc-for, webc-if or any component that supports a controller).
   */
  @Event({
    eventName: 'webcardinal:model:get',
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  getModelEvent: EventEmitter;

  @Prop() title = 'PDM Ionic Table';

  /**
   * can be 'bymodel' or 'byref'
   */
  @Prop() mode: string;

  @Prop({attribute: 'can-query'}) canQuery?: boolean = false;

  @Prop({attribute: 'icon-name'}) iconName?: string = undefined;

  @Prop() manager: string;

  @Prop({attribute: 'item-type'}) itemType: string;

  @Prop({attribute: 'no-content-message'}) noContentMessage: string = "No Content";

  @Prop({attribute: 'loading-message'}) loadingMessage: string = "Loading...";

  @Prop({attribute: 'item-reference-name'}) itemReferenceName: string;

  @Prop({attribute: 'items-per-page', mutable: true}) itemsPerPage?: number = 10;

  @Prop({attribute: 'current-page', mutable: true}) currentPage?: number = undefined;

  @Prop({mutable: true}) sort?: string = "asc";

  private webManager: WebManager = undefined;

  @State() contents: [] = undefined;

  private model = undefined;
  private chain = '';

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    this.webManager = await WebManagerService.getWebManager(this.manager);
    await this._getModel();
  }

  async _getModel(){
    this.chain = extractChain(this.host);

    if (this.chain) {
      try {
        this.model = await promisifyEventEmit(this.getModelEvent);
        if (this.chain !== '@')
          this.model = applyChain(this.model, this.chain);
      } catch (error) {
        console.error(error);
      }
    }
    await this.loadContents();
  }

  async loadContents(){
    if (!this.webManager)
      return;

    this.webManager.getAll( false, undefined, (err, contents) => {
      if (err){
        console.log(`Could not list items`, err);
        return;
      }
      this.contents = contents;
    });
  }

  @Watch('sort')
  @Watch('itemsPerPage')
  @Watch('currentPage')
  @Method()
  async refresh(){
    this.contents = undefined;
    await this.loadContents();
  }

  getTableHead(){
    let self = this;
    const getIcon = function(){
      if (!self.iconName)
        return;
      return (<ion-icon slot="start" className="ion-padding" name={self.iconName}></ion-icon>)
    }

    const getSearchBar = function(){
      if (self.canQuery)
        return (<ion-searchbar animated debounce="1000" placeholder="search..." search-icon="search-outline"
                             show-clear-button="always"></ion-searchbar>);
    }

    return (
      <ion-list-header lines="inset">
        <ion-toolbar>
          {getIcon()}
          <ion-title>{this.title}</ion-title>
          {getSearchBar()}
          <ion-buttons slot="end">
            <ion-button className="ion-padding-horizontal" color="primary" fill="outline">Add Stuff</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-list-header>
    );
  }

  getEmptyContent(){
    return (
      <ion-tem>{this.noContentMessage}</ion-tem>
    )
  }

  getLoadingContent(){
    return (
      <ion-tem>
        <ion-icon name="refresh-outline"></ion-icon>
        {this.loadingMessage}
      </ion-tem>
    )
  }

  getItem(reference){
    const Tag = this.itemType;
    const props = {
      manager: this.manager,
    }
    props[this.itemReferenceName] = reference;
    return (<Tag {...props}></Tag>);
  }

  getContent(){
    if (!this.contents)
      return this.getLoadingContent();
    if (!this.contents.length)
      return this.getEmptyContent();
    const content = [];
    this.contents.forEach(reference => {
      content.push(reference);
    });
    return content;
  }

  render() {
    if (!this.model)
      return;
    return (
      <Host>
        <ion-list className="ion-margin ion-no-padding">
          {this.getTableHead()}
          {this.getContent()}
        </ion-list>
      </Host>
    );
  }
}

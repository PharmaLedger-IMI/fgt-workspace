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
import {extractChain, promisifyEventEmit} from "../../utils";
import {HostElement} from '../../decorators'
import { applyChain } from "../../utils";

const ION_TABLE_MODES = {
  BY_MODEL: "bymodel",
  BY_REF: "byref"
}

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

  /**
   * Graphical Params
   */

  @Prop() title = 'PDM Ionic Table';

  @Prop({attribute: 'icon-name'}) iconName?: string = undefined;

  @Prop({attribute: 'no-content-message'}) noContentMessage: string = "No Content";

  @Prop({attribute: 'loading-message'}) loadingMessage: string = "Loading...";


  /**
   * Component Setup Params
   */

  /**
   * can be any of {@link ION_TABLE_MODES}
   * Decides if the tables works by:
   *  - {@link ION_TABLE_MODES.BY_MODEL}: uses the WebCardinal model api
   */
  @Prop() mode: string = ION_TABLE_MODES.BY_REF;

  /**
   * Shows the search bar or not. (not working)
   */
  @Prop({attribute: 'can-query'}) canQuery?: boolean = false;

  /**
   * sets the name of the manager to use
   * Only required if mode if {@link PdmIonTable#mode} is set to {@link ION_TABLE_MODES.BY_REF}
   */
  @Prop() manager?: string;


  /**
   * The tag for the item type that the table should use eg: 'li' would create list items
   */
  @Prop({attribute: 'item-type'}) itemType: string;


  /**
   * if the {@link PdmIonTable} is set to mode:
   *  - {@link ION_TABLE_MODES.BY_REF}: must be the querying attribute name so the items can query their own value
   *  - {@link ION_TABLE_MODES.BY_MODEL}: must be the model chain for content list
   */
  @Prop({attribute: 'item-reference'}) itemReference: string;


  /**
   * Querying/paginating Params - only available when mode is set by ref
   */
  @Prop({attribute: 'query', mutable: true}) query?: string = undefined;
  @Prop({attribute: 'page-count', mutable: true}) pageCount?: number = 0;
  @Prop({attribute: 'items-per-page', mutable: true}) itemsPerPage?: number = 10;
  @Prop({attribute: 'current-page', mutable: true}) currentPage?: number = undefined;
  @Prop({mutable: true}) sort?: string = "asc";

  private webManager: WebManager = undefined;

  @State() contents: [] = undefined;

  private model = undefined;
  private chain: string = '';

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    console.log(`connected`)
    switch(this.mode){
      case ION_TABLE_MODES.BY_MODEL:
        await this._getModel();
        break;
      case ION_TABLE_MODES.BY_REF:
        await this.loadContents();
    }

  }

  async _getModel(){
    console.log(`before chain extract`)
    this.chain = extractChain(this.host);
    console.log(`after chain extract ${this.chain}`)
    this.chain = this.chain || '@';
    try {
      console.log(`getting model`)
      this.model = await promisifyEventEmit(this.getModelEvent);
      console.log(`connected`)
      if (this.chain !== '@')
        this.model = applyChain(this.model, this.chain);
      return;
    } catch (error) {
      console.error(error);
    }

    // BindingService.bindChildNodes(this.host, {
    //   model: this.model,
    //   translationModel: {},
    //   recursive: true,
    //   chainPrefix: this.chain ? this.chain.slice(1) : null
    // });
  }

  async loadContents(){
    this.webManager = this.webManager || await WebManagerService.getWebManager(this.manager);
    if (!this.webManager)
      return;

    await this.webManager.getAll( true, undefined, (err, contents) => {
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

  getItem(reference?: string){
    const Tag = this.itemType;
    if (reference){
      const props = {
        manager: this.manager,
      }
      props[this.itemReference] = reference;
      return (<Tag {...props}></Tag>);
    }
    return (<Tag data-view-model={'@'}></Tag>)
  }

  getContent(){
    switch (this.mode){
      case ION_TABLE_MODES.BY_MODEL:
        return (<div data-for={'@' + this.itemReference}>
          {this.getItem()}
        </div>)
    }
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
    if ((!this.model && !this.contents))
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

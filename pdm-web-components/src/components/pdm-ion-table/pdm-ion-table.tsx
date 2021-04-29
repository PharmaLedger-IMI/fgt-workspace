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
import {EVENT_SEND_ERROR, EVENT_MODEL_GET} from "../../constants/events";

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
    eventName: EVENT_MODEL_GET,
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  getModelEvent: EventEmitter;

  /**
   * Through this event errors are passed
   */
  @Event({
    eventName: EVENT_SEND_ERROR,
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  sendErrorEvent: EventEmitter;


  private sendError(message: string, err?: object){
    const event = this.sendErrorEvent.emit(message);
    if (!event.defaultPrevented || err)
      console.log(`ION-TABLE ERROR: ${message}`, err);
  }

  /**
   * Graphical Params
   */

  @Prop() title = 'PDM Ionic Table';

  @Prop({attribute: 'icon-name'}) iconName?: string = undefined;

  @Prop({attribute: 'no-content-message'}) noContentMessage: string = "No Content";

  @Prop({attribute: 'loading-message'}) loadingMessage: string = "Loading...";

  @Prop({attribute: 'buttons', mutable: true}) buttons?: string[] = [];

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
  @Prop({attribute: 'paginated', mutable: true}) paginated?: boolean = true;
  @Prop({attribute: 'page-count', mutable: true}) pageCount?: number = 0;
  @Prop({attribute: 'items-per-page', mutable: true}) itemsPerPage?: number = 10;
  @Prop({attribute: 'current-page', mutable: true}) currentPage?: number = 0;
  @Prop({mutable: true}) sort?: string = undefined;

  private webManager: WebManager = undefined;

  @State() model = undefined;

  private chain: string = '';

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    console.log(`connected`)
    if (this.mode === ION_TABLE_MODES.BY_MODEL)
      await this.refresh();
  }

  async _getModel(){
    this.chain = extractChain(this.host);
    this.chain = this.chain || '@';
    try {
      this.model = await promisifyEventEmit(this.getModelEvent);
    } catch (error) {
      this.sendError(`Error getting model`, error);
    }
  }

  async loadContents(pageNumber?: number){
    this.webManager = this.webManager || await WebManagerService.getWebManager(this.manager);
    if (!this.webManager)
      return;

    if (this.paginated){
      await this.webManager.getPage(this.itemsPerPage, pageNumber || this.currentPage, this.query, this.sort, false, (err, contents) => {
        if (err){
          this.sendError(`Could not list items`, err);
          return;
        }
        this.currentPage = contents.currentPage;
        this.pageCount = contents.totalPages;
        this.model = contents.items;
      });
    } else {
      await this.webManager.getAll( false, undefined, (err, contents) => {
        if (err){
          this.sendError(`Could not list items`, err);
          return;
        }
        this.model = contents;
      });
    }
  }

  @Watch('query')
  async _updateByQuery(newQuery: string, oldQuery:string){
    if (!!oldQuery && oldQuery.startsWith('@')) // For WebCardinal Compatibility, otherwise it would trigger when they changed the value initially
      return

    if (!newQuery && !oldQuery)
      return;
    if (newQuery === oldQuery)
      return;
    this.model = undefined;
    await this.refresh();
  }

  @Method()
  async refresh(){
    switch(this.mode){
      case ION_TABLE_MODES.BY_REF:
        await this.loadContents();
        break;
      case ION_TABLE_MODES.BY_MODEL:
        await this._getModel();
    }
  }

  private async changePage(offset: number){
    if (this.currentPage + offset > 0 || this.currentPage + offset <= this.pageCount){
      this.model = undefined;
      await this.loadContents(this.currentPage + offset);
    }
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

    const getPagination = function(){
      if (!self.paginated)
        return;
      return (
        <ion-buttons slot="end">
          <ion-button name="previous-page" size="small" onClick={() => self.changePage(-1)} disabled={self.currentPage <= 1}>
            <ion-icon slot="icon-only" name="chevron-back-circle-outline"></ion-icon>
          </ion-button>
          <ion-label size="small">{self.currentPage}/{self.pageCount}</ion-label>
          <ion-button name="next-page" size="small" onClick={() => self.changePage(1)} disabled={!(self.currentPage < self.pageCount)}>
            <ion-icon slot="icon-only" name="chevron-forward-circle-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      )
    };

    const getButtons = function(){
      if (!self.buttons)
        return;
      const accum = [];

      const getButton = function(name, text){
        return (
          <ion-button data-tag={name}>
            {text}
          </ion-button>
        )
      }

      Object.keys(self.buttons).forEach(name => {
        accum.push(getButton(name, self.buttons[name]));
      });

      return (
        <ion-buttons slot="end">
          {... accum}
        </ion-buttons>
      )
    }

    return (
      <ion-list-header lines="inset">
        <ion-toolbar>
          {getIcon()}
          <ion-title>{self.title}</ion-title>
          {getSearchBar()}
          {getButtons()}
          {getPagination()}
        </ion-toolbar>
      </ion-list-header>
    );
  }

  getEmptyContent(){
    return (
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size="4" className="ion-justify-content-center">
            <ion-tem lines="none">
              <ion-button slot="start" onClick={() => this.refresh()}>
                <ion-icon slot="icon-only" name="refresh-outline"></ion-icon>
              </ion-button>
              <ion-label class="ion-text-center">
                {this.noContentMessage}
              </ion-label>
            </ion-tem>
          </ion-col>
        </ion-row>
      </ion-grid>
    )
  }

  getLoadingContent(){
    return (
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size="5" class="ion-justify-content-center">
              <multi-spinner type="circle"></multi-spinner>
          </ion-col>
        </ion-row>
      </ion-grid>
    )
  }

  getItem(reference){
    const Tag = this.itemType;
    let props = {};
    switch(this.mode){
      case ION_TABLE_MODES.BY_REF:
        props[this.itemReference] = reference;
        break;
      case ION_TABLE_MODES.BY_MODEL:
        props['model'] = reference;
        break;
    }

    return (<Tag {...props}></Tag>);
  }

  getContent(){
    if (!this.model)
      return this.getLoadingContent();
    const content = [];
    switch (this.mode){
      case ION_TABLE_MODES.BY_MODEL:
        if (!this.model[this.itemReference].length)
          return this.getEmptyContent();
        this.model[this.itemReference].forEach(item => {
          content.push(this.getItem(item));
        });
        break;
      case ION_TABLE_MODES.BY_REF:
        if (!this.model.length)
          return this.getEmptyContent();
        this.model.forEach(reference => {
          content.push(this.getItem(reference));
        });
        break;
    }
    return content;
  }

  @Watch('model')
  render() {
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

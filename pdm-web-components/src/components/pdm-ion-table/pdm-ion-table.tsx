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
import {HostElement} from '../../decorators'
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";

// @ts-ignore
const SEARCH_BAR_STATE = {
  OPEN: 'open',
  CLOSED: 'closed'
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
      console.log(`ION-TABLE ERROR: ${message}`, err);
  }

  /**
   * Graphical Params
   */

  @Prop() title = 'PDM Ionic Table';

  @Prop({attribute: 'icon-name'}) iconName?: string = undefined;

  @Prop({attribute: 'no-content-message', mutable: true}) noContentMessage?: string = "No Content";

  @Prop({attribute: 'loading-message', mutable: true}) loadingMessage?: string = "Loading...";

  @Prop({attribute: 'query-placeholder', mutable: true}) searchBarPlaceholder?: string =  "enter search terms...";

  @Prop({attribute: 'buttons', mutable: true}) buttons?: string[] = [];

  /**
   * Component Setup Params
   */

  /**
   * Shows the search bar or not. (not working)
   */
  @Prop({attribute: 'can-query'}) canQuery?: boolean = false;

  /**
   * sets the name of the manager to use
   */
  @Prop() manager?: string;


  /**
   * The tag for the item type that the table should use eg: 'li' would create list items
   */
  @Prop({attribute: 'item-type'}) itemType: string;

  /**
   * Option props to be passed to child elements in from a JSON object in value key format only format
   */
  @Prop({attribute: 'item-props', mutable:true}) itemProps?: any = undefined;


  /**
   * the querying attribute name so the items can query their own value
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

  // Graphical states
  @State() searchBarVisible: boolean = undefined;

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
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
    if (!this.host || !this.host.isConnected) // For WebCardinal Compatibility, otherwise it would trigger when they changed the value initially
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
    await this.loadContents();
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
      return (<ion-icon slot="start" class="ion-padding" name={self.iconName}></ion-icon>)
    }

    const getSearchBar = function(){
      if (!self.canQuery)
        return;

      const getButton = function() {
        return (
          <ion-button slot="end" onClick={() => self.searchBarVisible = !self.searchBarVisible}>
            <ion-icon slot="icon-only" name={self.searchBarVisible ? "search-circle-outline" :"search-circle"}></ion-icon>
          </ion-button>
        )
      }

      const getSearch = function(){
        const props = {};
        if (self.searchBarVisible !== undefined)
          props['class'] = self.searchBarVisible ? SEARCH_BAR_STATE.OPEN : SEARCH_BAR_STATE.CLOSED;
        return (
          <ion-searchbar slot="secondary" debounce={1000} placeholder={self.searchBarPlaceholder}
                         search-icon="search-outline" {...props}></ion-searchbar>)
      }

      const elements = [];
      if (self.searchBarVisible)
        elements.push(getSearch());
      elements.push(getButton());

      return elements;
    }

    const getPagination = function(){
      if (!self.paginated)
        return;
      // @ts-ignore
      return (
        <ion-buttons slot="end">
          <ion-button size="small" onClick={() => self.changePage(-1)} disabled={self.currentPage <= 1}>
            <ion-icon slot="icon-only" name="chevron-back-circle-outline"></ion-icon>
          </ion-button>
          <ion-label>{self.currentPage}/{self.pageCount}</ion-label>
          <ion-button size="small" onClick={() => self.changePage(1)} disabled={!(self.currentPage < self.pageCount)}>
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
    // @ts-ignore
    return (
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size="4" class="ion-justify-content-center">
              <ion-button slot="start" fill="clear" onClick={() => this.refresh()}>
                <ion-icon slot="icon-only" name="refresh-outline"></ion-icon>
              </ion-button>
              <ion-label class="ion-text-center">
                {this.noContentMessage}
              </ion-label>
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
              <multi-spinner type={SUPPORTED_LOADERS.circles}></multi-spinner>
          </ion-col>
        </ion-row>
      </ion-grid>
    )
  }

  getItem(reference){
    const Tag = this.itemType;
    let props = {};
    props[this.itemReference] = reference;

    if (!!this.itemProps){
      this.itemProps.split(';').forEach(ip => {
        const keyValue = ip.split(':');
        props[keyValue[0]] = keyValue[1];
      });
    }

    return (<Tag {...props}></Tag>);
  }

  getContent(){
    if (!this.model)
      return this.getLoadingContent();
    const content = [];

    if (!this.model.length)
      return this.getEmptyContent();
    this.model.forEach(reference => {
      content.push(this.getItem(reference));
    });

    return content;
  }

  render() {
    return (
      <Host>
        <ion-list slot="fixed" class="ion-no-padding pdm-list-header">
          {this.getTableHead()}
        </ion-list>
        <ion-list class="ion-no-padding pdm-list-content">
          {this.getContent()}
        </ion-list>
      </Host>
    );
  }
}

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

  @Prop({attribute: 'table-title'}) tableTitle = 'PDM Ionic Table';
  @Prop({attribute: 'icon-name'}) iconName?: string = undefined;
  @Prop({attribute: 'no-content-message', mutable: true}) noContentMessage?: string = "No Content";
  @Prop({attribute: 'loading-message', mutable: true}) loadingMessage?: string = "Loading...";
  @Prop({attribute: 'query-placeholder', mutable: true}) searchBarPlaceholder?: string =  "enter search terms...";
  @Prop({attribute: 'buttons', mutable: true}) buttons?: string[] | {} = [];

  /**
   * Component Setup Params
   */

  /**
   * Shows the search bar or not. (not working)
   */
  @Prop({attribute: 'can-query'}) canQuery?: boolean = true;
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
   * the querying attribute name so the items can query their own value
   */
  @Prop({attribute: 'auto-load'}) autoLoad: boolean = false;

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
    if (this.autoLoad)
      await this.loadContents();
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

  private getEmptyContent(){
    // @ts-ignore
    return (
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size="4" class="ion-justify-content-center">
              <ion-button slot="start" fill="clear" onClick={() => this.refresh()}>
                <ion-icon slot="icon-only" name="refresh"></ion-icon>
              </ion-button>
              <ion-label class="text-align-center">
                {this.noContentMessage}
              </ion-label>
          </ion-col>
        </ion-row>
      </ion-grid>
    )
  }

  private getLoadingContent(){
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

  private getItem(reference){
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

  private getContent(){
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

  private getTableHeader(){
    const self = this;

    const getSearch = function(){
      if (!self.canQuery)
        return;
      const props = {};
      if (self.searchBarVisible !== undefined)
        props['class'] = self.searchBarVisible ? SEARCH_BAR_STATE.OPEN : SEARCH_BAR_STATE.CLOSED;
      return (
        <div class="ion-margin-end">
          <ion-searchbar debounce={1000} placeholder={self.searchBarPlaceholder}
                         search-icon="search-outline" {...props}></ion-searchbar>
        </div>
      )
    }

    const getActionButtons = function(){
      if (!self.buttons || !Object.keys(self.buttons).length)
        return;

      const getButton = function(name, props, index){
        const hasIcon = typeof props !== 'string';
        const buttonLabel =  hasIcon ? props.label : props;
        const buttonIcon = hasIcon ? props.icon : undefined;

        const getIcon = function(){
          if (!buttonIcon)
            return;
          return (<ion-icon class="ion-margin-start" slot="end" name={buttonIcon}></ion-icon>)
        }

        return (
          <ion-button fill="solid" class="ion-margin-start" color={index === 0 ? "secondary" : "tertiary"} data-tag={name}>
            {buttonLabel}
            {getIcon()}
          </ion-button>
        )
      }

      return Object.keys(self.buttons).map((name, i) => getButton(name, self.buttons[name], i));
    }

    return (
      <div class="ion-margin-top ion-padding-horizontal">
        <ion-row class="ion-align-items-center ion-justify-content-between">
          <div class="flex ion-align-items-center">
            <ion-icon size="large" color="medium" name={self.iconName}></ion-icon>
            <ion-label class="ion-text-uppercase ion-padding-start" color="secondary">{self.tableTitle}</ion-label>
          </div>
          <ion-row class="ion-align-items-center">
            {getSearch()}
            <ion-buttons>
              {...getActionButtons()}
            </ion-buttons>
          </ion-row>
        </ion-row>
      </div>
    )
  }

  getPagination(){
    if (!this.paginated)
      return;
    return (
      <ion-row class="ion-justify-content-center ion-align-items-center">
        <ion-buttons>
          <ion-button fill="clear" size="small" color="medium" onClick={() => this.changePage(-1)} disabled={this.currentPage <= 1}>
            <ion-icon slot="icon-only" name="chevron-back-circle-outline"></ion-icon>
          </ion-button>
          <ion-label color="medium" >{this.currentPage}/{this.pageCount}</ion-label>
          <ion-button fill="clear" size="small" color="medium"  onClick={() => this.changePage(1)} disabled={!(this.currentPage < this.pageCount)}>
            <ion-icon slot="icon-only" name="chevron-forward-circle-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-row>
    )
  };

  render() {
    return (
      <Host>
        {this.getTableHeader()}
        <div class="ion-padding">
          {this.getContent()}
        </div>
        {this.getPagination()}
      </Host>
    );
  }
}

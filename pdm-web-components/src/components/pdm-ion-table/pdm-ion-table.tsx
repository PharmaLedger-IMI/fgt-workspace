import {WebManager, WebManagerService} from '../../services/WebManagerService';
import {HostElement} from '../../decorators'
import {SUPPORTED_LOADERS} from "../multi-spinner/supported-loader";
import {Component, ComponentInterface, EventEmitter, h, Host, Prop, Element, Event, State, Watch, Method} from "@stencil/core";


@Component({
  tag: 'pdm-ion-table',
  styleUrl: 'pdm-ion-table.css',
  shadow: false
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
  @Prop({attribute: 'search-bar-placeholder', mutable: true}) searchBarPlaceholder?: string =  "enter search terms...";
  // @Prop({attribute: 'buttons', mutable: true}) buttons?: string[] | {} = [];
  // @Prop({attribute: 'send-real-events', mutable: true}) sendRealEvents: boolean = false;

  /**
   * Component Setup Params
   */

  /**
   * Shows the search bar or not.
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

  private updateTable(newModel){
    if (!this.model){
      this.model = [...newModel];
      return;
    }
    const model = this.model;
    const equals = [];
    newModel.forEach((m,i) => {
      if (m === model[i])
        equals.push(i);
    });

    this.model = [...newModel];

    this.element.querySelectorAll(`div[id="ion-table-content"] > *`).forEach(async (e,i) => {
      if (equals.indexOf(i) !== -1)
        if (e.refresh)
          await e.refresh();
    });
  }

  async performSearch(evt: any) {
    console.log(`# ${this.manager} search keyword=${evt.detail}`)
    this.query = evt.detail;
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
        this.updateTable(contents.items);
      });
    } else {
      await this.webManager.getAll( false, undefined, (err, contents) => {
        if (err){
          this.sendError(`Could not list items`, err);
          return;
        }
        console.log(contents);
        this.updateTable(contents);
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
      return (
        <div class="ion-margin-end">
          <pdm-search-bar onSearch={self.performSearch.bind(self)} placeholder={self.searchBarPlaceholder}> </pdm-search-bar>
        </div>
      )
    }

    return (
      <div class="ion-margin-top ion-padding-horizontal">
        <ion-row class="ion-align-items-center ion-justify-content-between">
          <div class="flex ion-align-items-center">
            <ion-icon size="large" color="secondary" name={self.iconName}></ion-icon>
            <ion-label class="ion-text-uppercase ion-padding-start" color="secondary">{self.tableTitle}</ion-label>
          </div>
          <ion-row class="ion-align-items-center">
            {getSearch()}
            <ion-buttons>
              <slot name="buttons"></slot>
            </ion-buttons>
          </ion-row>
        </ion-row>
      </div>
    )
  }

  getheaders(){
    const Tag = this.itemType;
    let props = {};
    props[this.itemReference] = 'header';
    props['isHeader'] = true;
    

    // if (!!this.itemProps){
    //   this.itemProps.split(';').forEach(ip => {
    //     const keyValue = ip.split(':');
    //     props[keyValue[0]] = keyValue[1];
    //   });
    // }

    return (<Tag {...props}></Tag>);
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

  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
    if (this.autoLoad)
      await this.loadContents();
  }

  render() {
    return (
      <Host>
        {this.getTableHeader()}
        <div id="ion-table-content" class="ion-padding">
          {this.getheaders()}
          {this.getContent()}
        </div>
        {this.getPagination()}
      </Host>
    );
  }
}

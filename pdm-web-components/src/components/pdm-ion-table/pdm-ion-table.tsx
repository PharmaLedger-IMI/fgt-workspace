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
  @Prop({attribute: 'keyword-query', mutable: true}) keywordQuery?: string = undefined;
  @Prop({attribute: 'dsu-query', mutable: true}) dsuQuery?: string = '[]';
  @Prop({attribute: 'paginated', mutable: true}) paginated?: boolean = true;
  @Prop({attribute: 'page-count', mutable: true}) pageCount?: number = 0;
  @Prop({attribute: 'items-per-page', mutable: true}) itemsPerPage?: number = 10;
  @Prop({attribute: 'current-page', mutable: true}) currentPage?: number = 0;
  @Prop({mutable: true}) sort?: string = undefined;

  private webManager: WebManager = undefined;

  @State() _dataSource = undefined;

  @Watch('keywordQuery')
  async _updateByQuery(newQuery: string, oldQuery:string){
    // issue #57 - doesn't update a state here because can stick in an infinite loop or rerender unnecessarily
    if ((!newQuery && !oldQuery) || (newQuery === oldQuery))
      return;
    this._dataSource = undefined;
    await this.loadContents();
  }

  @Watch('dsuQuery')
  async updateDsuQuery(newDsuQuery, oldDsuQuery) {
    //  issue #57 - doesn't update a state here because can stick in an infinite loop or rerender unnecessarily
    if ((!newDsuQuery && !oldDsuQuery) || (newDsuQuery === oldDsuQuery))
      return;
    this._dataSource = undefined;
    await this.loadContents();
  }

  @Method()
  async refresh(){
    await this.loadContents();
  }

  /** updateTable render logic:
   *  - before first  render, the "loadContents" method is called to query database by "componentWillLoad"
   *  -  when "loadContents" get the result, call "updateTable"
   *  - "updateTable" update "_dataSource" that is a state, and then, call method "render()" by stencil lifecycle
   *  - method "getContent" will update UI according to "_dataSource" variable
   * */
  private updateTable(newModel){
    if (!this._dataSource){
      this._dataSource = [...newModel];
      return;
    }
    const model = this._dataSource;
    const equals = [];
    newModel.forEach((m,i) => {
      if (m === model[i])
        equals.push(i);
    });

    this._dataSource = [...newModel];

    this.element.querySelectorAll(`div[id="ion-table-content"] > *`).forEach(async (e,i) => {
      if (equals.indexOf(i) !== -1)
        if (e.refresh)
          await e.refresh();
    });
  }

  async performSearch(evt: any) {
    console.log(`# ${this.manager} search keyword=${evt.detail}`)
    this.keywordQuery = evt.detail;
  }

  async loadContents(pageNumber?: number){
    console.log('$$$ loadContent=')
    this.webManager = this.webManager || await WebManagerService.getWebManager(this.manager);
    if (!this.webManager)
      return;

    let _dsuQuery = [];
    try {
      _dsuQuery = JSON.parse(this.dsuQuery)
    } catch (e) {}

    if (this.paginated){
      await this.webManager.getPage(this.itemsPerPage, pageNumber || this.currentPage, _dsuQuery, this.keywordQuery, this.sort, false, (err, contents) => {
        if (err){
          this.sendError(`Could not list items`, err);
          return;
        }
        this.currentPage = contents.currentPage;
        this.pageCount = contents.totalPages;
        this.updateTable(contents.items);
      });
    } else {
      await this.webManager.getAll( false, _dsuQuery, (err, contents) => {
        if (err){
          this.sendError(`Could not list items`, err);
          return;
        }
        console.log(contents);
        this.updateTable(contents);
      });
    }
  }

  private async changePage(offset: number){
    if (this.currentPage + offset > 0 || this.currentPage + offset <= this.pageCount){
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
    if (!this._dataSource)
      return this.getLoadingContent();

    if (!this._dataSource.length)
      return this.getEmptyContent();

    const self = this;
    return this._dataSource.map(reference => self.getItem(reference));
  }

  private getTableHeader(){
    const self = this;

    const getSearch = function(){
      if (!self.canQuery)
        return;
      return (
        <div class="ion-margin-end">
          <pdm-search-bar onSearchEvt={self.performSearch.bind(self)} placeholder={self.searchBarPlaceholder}> </pdm-search-bar>
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

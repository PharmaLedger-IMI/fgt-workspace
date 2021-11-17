import {Component, Element, h, Host, Prop, State, Watch} from '@stencil/core';
import {HostElement} from "../../decorators";
import {Chart, registerables} from 'chart.js';

Chart.register(...registerables);

@Component({
  tag: 'pdm-chartjs',
  styleUrl: 'pdm-chartjs.css',
  shadow: true,
})
export class PdmChartjs {
  private chart: any;
  private _parse = (strObj: string, res: any): any => {
    if (strObj.startsWith('@') || !strObj)
      return res;

    try {
      res = JSON.parse(strObj)
    } catch (err) {
      console.log('parse error err=', err)
    }
    return res;
  }

  @HostElement() host: HTMLElement;

  @Element() element: HTMLElement;

  @Prop({attribute: 'container-id'}) containerId: string = 'DTDACXSWQ';
  @Prop({attribute: 'type'}) type: string = 'bar';
  @Prop({attribute: 'card-title'}) cardTitle: string = 'Title';
  @Prop({attribute: 'card-sub-title'}) cardSubTitle: string = 'sub-title';
  @Prop({attribute: 'show-data-table'}) showDataTable: boolean = false;

  @Prop({attribute: 'table-data-structure', mutable: true}) tableDataStruct: string = '[]'
  @State() _tableDataStruct: any[];

  @Watch('tableDataStruct')
  watchTableDataStruct(newStruct: string) {
    this._tableDataStruct = this._parse(newStruct, [])
  }

  @Prop({attribute: 'data'}) data: string = '[]';
  @State() _data: any[];


  @Watch('data')
  watchData(newData: string) {
    this._data = this._parse(newData, [])
  }


  @Prop({attribute: 'options'}) options: string = '{}';
  @State() _options: any;

  @Watch('options')
  watchOptions(newOptions: string) {
    this._options = this._parse(newOptions, {})
  }


  @Prop({attribute: 'table-data-source'}) tableDataSrc: string = '[]';
  @State() _tableDataSrc: any;
  @State() _filteredTableRows: any;

  @Watch('tableDataSrc')
  watchTableDataSrc(newData: string) {
    this._tableDataSrc = this._parse(newData, [])
    this._filteredTableRows = [...this._tableDataSrc];
  }

  clickHandler(evt: any) {
    const points = this.chart.getElementsAtEventForMode(evt, 'nearest', {intersect: false}, true);
    if (points.length) {
      const id = points[0];
      const label = this.chart.data.labels[id.index];
      const value = this.chart.data.datasets[id.datasetIndex].data[id.index];
      console.log('#chart click=', this.containerId, ' label=', label, ' value=', value, ' evt=', id)
      if (this.showDataTable) {
        this._filteredTableRows = this._tableDataSrc.filter((v) => {
          return v.status === label;
        })
      }
    }
  }

  destroy(chart: any) {
    chart.destroy();
  }

  buildDataTable(): any[] {
    if (!this.showDataTable)
      return [];

    const self = this;
    const header = this._tableDataStruct.map((col => {
      return (<ion-col {...col.props}><h6><strong>{col.label}</strong></h6></ion-col>)
    }))

    let rows = [<div>No data available</div>];
    if (this._filteredTableRows.length > 0) {
      rows = this._filteredTableRows.map((shipmentRow) => {
        const cols = self._tableDataStruct.map((col) => {
          return (<ion-col {...col.props}><h6>{shipmentRow[col.id]}</h6></ion-col>)
        })
        return (<ion-row>{...cols}</ion-row>)
      })
    }

    return [
      <ion-row className="ion-margin-top">
        {...header}
      </ion-row>,
      ...rows
    ]
  }

  componentWillLoad() {
    this.watchData(this.data);
    this.watchOptions(this.options);
    this.watchTableDataSrc(this.tableDataSrc);
    this.watchTableDataStruct(this.tableDataStruct)
  }

  render() {
    return (
      <Host>
        <div>
          <ion-card>
            <ion-card-header>
              <ion-card-title>{this.cardTitle}</ion-card-title>
              <ion-card-subtitle>{this.cardSubTitle}</ion-card-subtitle>
            </ion-card-header>

            <ion-card-content>
              <canvas id={`${this.containerId}`}></canvas>
              {...this.buildDataTable()}
            </ion-card-content>
          </ion-card>
        </div>
      </Host>
    )
  }

  componentDidRender() {
    const self = this;
    let chartContainer = this.element.shadowRoot.querySelector(`#${this.containerId}`);
    const chartSettings = {
      type: this.type,
      data: this._data,
      options: {
        onClick: (evt) => self.clickHandler(evt),
        ...this._options
      }
    }

    if (this.chart)
      self.destroy(this.chart);
    // @ts-ignore
    this.chart = new Chart(chartContainer, chartSettings);
    console.log('# render chart id=', this.containerId, ' chart=', this.chart);
  }
}

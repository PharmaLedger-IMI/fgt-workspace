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
    if (strObj) {
      try {
        res = JSON.parse(strObj)
      } catch (err) {
        console.log('parse error err=', err)
      }
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

  @Prop({attribute: 'data'}) data: string = '[]';
  @State() _data: any;

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

    let rows = [];
    if (this._filteredTableRows || this._filteredTableRows.length > 0)
      rows = this._filteredTableRows.map((tableShipment) => {
        return (
          <ion-row>
            <ion-col size="3"><h6>{tableShipment.shipmentId}</h6></ion-col>
            <ion-col size="4"><h6>{tableShipment.requesterId}</h6></ion-col>
            <ion-col size="3"><h6>{tableShipment.status}</h6></ion-col>
            <ion-col size="2"><h6>{tableShipment.days}</h6></ion-col>
          </ion-row>
        )
      })

    return [
      <ion-row className="ion-margin-top">
        <ion-col size="3"><h6><strong>#</strong></h6></ion-col>
        <ion-col size="4"><h6><strong>Requester</strong></h6></ion-col>
        <ion-col size="3"><h6><strong>Status</strong></h6></ion-col>
        <ion-col size="2"><h6><strong>Last Update</strong></h6></ion-col>
      </ion-row>,
      ...rows
    ]
  }

  componentWillLoad() {
    this.watchData(this.data);
    this.watchOptions(this.options);
    this.watchTableDataSrc(this.tableDataSrc);
  }

  render() {
    console.log('# pdm-chartjs render()')
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

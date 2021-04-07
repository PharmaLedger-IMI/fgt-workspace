import { Component, ComponentDidLoad, ComponentInterface, h, Host,  Prop, State, Method } from '@stencil/core';

@Component({
  tag: 'pdm-ion-table',
  styleUrl: 'pdm-ion-table.css',
  shadow: true,
})
export class PdmIonTable implements ComponentInterface, ComponentDidLoad {
  private itemsPerPage = 10;
  private offset = 0;
  private serviceProvider = undefined;

  @State() private items: [];
  @State() private itemCount: number;

  @Prop() tableTile = 'PDM Ionic Table';

  @Method()
  async setServiceProvider(serviceProvider: Function) {
    this.serviceProvider = serviceProvider;
    this.loadPage();
  }

  private loadPage(): void {
    if (this.serviceProvider)
      this.serviceProvider();
    console.log(this.itemsPerPage);
    console.log(this.offset);
    console.log(this.items);
    console.log(this.itemCount);
  }

  render() {
    return (
      <Host>

      </Host>
    );
  }

  [memberName: string]: any;

  componentDidLoad(): void {
  }

}

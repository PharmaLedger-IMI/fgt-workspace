import {Component, Element, Event, EventEmitter, h, Host, Prop, State, Watch} from '@stencil/core';
import {HostElement} from "../../decorators";

@Component({
  tag: 'status-updater-button',
  styleUrl: 'status-updater-button.css',
  shadow: false,
})
export class StatusUpdaterButton {
  @HostElement() host: HTMLElement;
  @Element() element;

  @Prop({attribute: 'available-options'}) availableOptions: string = '[]';
  @Prop({attribute: 'popup-options'}) popupOptions: string = '{}';
  @Prop({attribute: 'individual-properties'}) individualProperties: string = '{}';

  /* Properties set to all buttons */
  @Prop({attribute: 'color'}) color: string = 'primary';
  @Prop({attribute: 'disabled'}) disabled: boolean = false;
  @Prop({attribute: 'expand'}) expand: string = 'full';
  @Prop({attribute: 'fill'}) fill: string = 'solid';
  @Prop({attribute: 'size'}) size: string = 'default';
  @Prop({attribute: 'shape'}) shape: string = undefined;
  @Prop({attribute: 'buttons-css-class'}) buttonsCssClass: string = '';
  @Prop({attribute: 'strong'}) strong: boolean = false;

  @Prop({attribute: 'show-add-detail'}) showAddDetail: boolean = true;

  @Watch('availableOptions')
  watchAvailableOptions(newValue: string) {
    try {
      this._availableOptions = JSON.parse(newValue || '[]')
    } catch (err) {
      console.log(err);
      this._availableOptions = [];
    }
  }

  @Watch('individualProperties')
  watchIndividualProperties(newValue: string) {
    try {
      this._individualProperties = JSON.parse(newValue || '{}')
    } catch (err) {
      console.log(err);
      this._individualProperties = {};
    }
  }

  @Watch('popupOptions')
  watchPopupOptions(newValue) {
    try {
      const newOptions = JSON.parse(newValue);
      this._popupOptions = Object.assign(this._popupOptions, newOptions);
    } catch (err) {
      console.log(err)
    }
  }

  @State() _availableOptions: Array<Status>;

  @State() _individualProperties: any = {};

  @State() _popupOptions: PopupOptions = {
    message: 'Please confirm status update',
    confirmButtonLabel: "Confirm",
    cancelButtonLabel: "Cancel",
    cssClass: 'status-updater-alert',
    inputs: [{name: 'extraInfo', placeholder: 'Add detail (optional)'}]
  }

  @Event()
  clickUpdaterButton: EventEmitter;

  async showPopup(status: Status, popupOptions: PopupOptions) {
    const self = this;
    const alert: any = document.createElement('ion-alert');
    alert.header = popupOptions.header;
    alert.message = popupOptions.message;
    alert.cssClass = popupOptions.cssClass;
    alert.inputs = popupOptions.inputs
    alert.buttons = [
      {text: popupOptions.cancelButtonLabel, role: 'cancel'},
      {
        text: popupOptions.confirmButtonLabel, role: 'confirm',
        handler: (popupInputData) => {
          self.clickUpdaterButton.emit({
            status: status.status,
            extraInfo: popupInputData.extraInfo || ''
          });
        }
      }
    ];
    document.body.appendChild(alert);
    await alert.present();
  }

  buildStatusButton(status: Status, individualProperties: any) {
    const self = this;
    return (
      <ion-button
        color={status.color || this.color}
        disabled={individualProperties.disabled || this.disabled}
        expand={individualProperties.expand || this.expand}
        fill={individualProperties.fill || this.fill}
        shape={individualProperties.shape || this.shape}
        size={individualProperties.size || this.size}
        strong={individualProperties.strong || this.strong}
        className={individualProperties.buttonCssClass || this.buttonsCssClass}
        onClick={() => {
          if (individualProperties.showAddDetail || this.showAddDetail)
            self.showPopup(status, Object.assign(self._popupOptions,individualProperties.popupOptions))
        }}
      >
        {status.action || status.label}
      </ion-button>
    )
  }

  buildOptions(availableOptions: Status[]): Array<any> {
    const self = this;

    return availableOptions.map((status) => {
      const individualProperties = self._individualProperties[status.status] || {};
      return (
        <ion-row className="ion-margin-bottom ion-align-items-center ion-justify-content-center">
          {self.buildStatusButton(status, individualProperties)}
        </ion-row>
      )
    })
  }

  componentWillLoad() {
    const parse = (value) => {
      let parsed;
      try {
        parsed = JSON.parse(value);
      } catch (err) {
        console.log(err);
      }
      return parsed;
    }

    this._availableOptions = parse(this.availableOptions) || [];
    this._popupOptions = Object.assign(this._popupOptions, parse(this.popupOptions))
    this._individualProperties = parse(this.individualProperties) || {};
  }

  render() {
    const self = this;
    return (
      <Host>
        {...self.buildOptions(self._availableOptions)}
      </Host>
    );
  }
}

interface Status {
  status: string;
  action: string;
  label: string;
  color: string;
  paths: Array<string>
}

interface PopupOptions {
  header?: string;
  message?: string;
  cancelButtonLabel: string;
  confirmButtonLabel: string;
  cssClass?: string;
  inputs?: any[];
}

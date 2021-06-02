export const BAR_CODE_POPOVER_ELEMENT = 'bar-code-pop-over';

function defineBarcodePopoverContent(){
  if (!!customElements.get(BAR_CODE_POPOVER_ELEMENT))
    return;

  customElements.define(BAR_CODE_POPOVER_ELEMENT, class extends HTMLElement{
    connectedCallback(){
      const popOverElement = document.querySelector('ion-popover');
      if (!popOverElement || !popOverElement.componentProps)
        return console.log(`No Properties passed to the Bar Code Pop over`);
      const {type, size, scale, data} = popOverElement.componentProps;
      this.innerHTML = `
<ion-content>
  <barcode-generator type="${type}" size="${size || 32}" scale="${scale || 3}" data="${data}"></barcode-generator>
</ion-content>`;
    }
  });
}

/**
 * Shows a popover with the barcode/2dMatrix etc with the provided props
 * @param {event} [evt] the click event so the popover show in the correct place. if ommited will show in the center
 * @param {{type: string, size: string: scale: string: data: any}} props the properties to pass to the {@link BarcodeGenerator}
 * @return {Promise<void>}
 */
export async function getBarCodePopOver(props, evt){

  defineBarcodePopoverContent();
  props = Object.assign({
    type: "code128",
    size: "32",
    scale: "6",
    data: ""
  }, props)
  const popover = Object.assign(document.createElement('ion-popover'), {
    component: BAR_CODE_POPOVER_ELEMENT,
    cssClass: 'bar-code-popover',
    translucent: true,
    event: evt,
    showBackdrop: false,
    animated: true,
    backdropDismiss: true,
    componentProps: props
  });
  document.body.appendChild(popover);
  await popover.present();
}

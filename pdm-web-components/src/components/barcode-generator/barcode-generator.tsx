import {Component, h, Prop, Element, State, Watch} from '@stencil/core';
import {stringToBoolean} from "../../utils/utilFunctions";
import bwipjs from "../../libs/bwip.js";
const TWO_D_BARCODES = ["datamatrix","gs1datamatrix","qrcode"];

@Component({
  tag: 'barcode-generator',
  styleUrl: 'barcode-generator.css',
  shadow: true,
})
export class BarcodeGenerator {

  @Element() element;

  @Prop() data:any;

  /**
   * description: `The barcode type. Accepted values are 'gs1datamatrix','datamatrix','qrcode', 'code128','code11','isbn'.`,
   * isMandatory: true,
   * propertyType: `string`
   */
  @Prop() type:string="qrcode";

  /**
   * description: `A title that will be used for the current component instance.`,
   * isMandatory: false,
   * propertyType: `string`
   */
  @Prop() title: string = "";

  /**
   * description: `The size of the barcode in mm. Default is set to 32 mm.`,
   * isMandatory: false,
   * propertyType: `integer`
   */
  @Prop() size?:any = 32;

  /**
   * description: `This option allows to print the input data below the generated barcode.`,
   * isMandatory: false,
   * propertyType: `boolean`
   */
  @Prop() includeText:boolean = false;

  @State() isLoaded = false;

  @Watch("data")
  drawQRCodeCanvas(){
    if(this.isLoaded && this.data.length>0){
      let canvas = this.element.querySelector("canvas");
      if (!canvas)
        canvas = this.element.shadowRoot.querySelector('canvas');
      canvas.innerHTML="";

      let tryToGenerateBarcode = () => {
        //@ts-ignore
        if (bwipjs) {
          try{
            let options =  {
              bcid: this.type,       // Barcode type
              text: this.data,    // Text to encode
              scale: 3,               // 3x scaling factor
              height: this.size,              // Bar height, in millimeters
              textxalign: 'center',        // Always good to set this
            }

            if(stringToBoolean(this.includeText)){
              options['alttext'] = this.data;
            }

            if(TWO_D_BARCODES.indexOf(this.type)!==-1){
              options['width'] = this.size;
            }

            //@ts-ignore
            bwipjs.toCanvas(canvas,options, function (err) {
              if (err) {
                // @ts-ignore
                console.log(err);
              }
            });
          }catch (e) {
            //most commonly errors come from wrong input data format
          }

        } else {
          // @ts-ignore
          setTimeout(tryToGenerateBarcode, 100);
        }
      }
      tryToGenerateBarcode();
    }
  }

  componentDidLoad(){
    this.isLoaded = true;
    this.drawQRCodeCanvas();
  }

  render() {
    return (
      <ion-card>
        <div class="code_container">
          <div class="card-body text-center">
            <canvas class="code_canvas"/>
          </div>
        </div>
        <ion-card-header>
          <ion-card-subtitle>{this.title}</ion-card-subtitle>
        </ion-card-header>
      </ion-card>
    );
  }
}

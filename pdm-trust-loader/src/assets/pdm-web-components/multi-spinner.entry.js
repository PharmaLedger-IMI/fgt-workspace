import { r as registerInstance, h, f as Host, g as getElement } from './index-21b82b33.js';
import { H as HostElement } from './index-993dbba1.js';
import { S as SUPPORTED_LOADERS } from './supported-loader-4cd02ac2.js';

const multiSpinnerCss = ":host{display:block}.spinner-simple{margin:100px auto;width:40px;height:40px;position:relative;text-align:center;-webkit-animation:sk-rotate 2.0s infinite linear;animation:sk-rotate 2.0s infinite linear}.dot1,.dot2{width:60%;height:60%;display:inline-block;position:absolute;top:0;background-color:var(--ion-color-primary);border-radius:100%;-webkit-animation:sk-bounce 2.0s infinite ease-in-out;animation:sk-bounce 2.0s infinite ease-in-out}.dot2{top:auto;background-color:var(--ion-color-secondary);bottom:0;-webkit-animation-delay:-1.0s;animation-delay:-1.0s}@-webkit-keyframes sk-rotate{100%{-webkit-transform:rotate(360deg)}}@keyframes sk-rotate{100%{transform:rotate(360deg);-webkit-transform:rotate(360deg)}}@-webkit-keyframes sk-bounce{0%,100%{-webkit-transform:scale(0.0)}50%{-webkit-transform:scale(1.0)}}@keyframes sk-bounce{0%,100%{transform:scale(0.0);-webkit-transform:scale(0.0)}50%{transform:scale(1.0);-webkit-transform:scale(1.0)}}.spinner-circle{width:40px;height:40px;position:relative;margin:100px auto}.double-bounce1,.double-bounce2{width:100%;height:100%;border-radius:50%;background-color:var(--ion-color-primary);opacity:0.6;position:absolute;top:0;left:0;-webkit-animation:sk-bounce-circle 2.0s infinite ease-in-out;animation:sk-bounce-circle 2.0s infinite ease-in-out}.double-bounce2{background-color:var(--ion-color-secondary);-webkit-animation-delay:-1.0s;animation-delay:-1.0s}@-webkit-keyframes sk-bounce-circle{0%,100%{-webkit-transform:scale(0.0)}50%{-webkit-transform:scale(1.0)}}@keyframes sk-bounce-circle{0%,100%{transform:scale(0.0);-webkit-transform:scale(0.0)}50%{transform:scale(1.0);-webkit-transform:scale(1.0)}}.spinner-cube{margin:100px auto;width:40px;height:40px;position:relative}.cube1,.cube2{background-color:var(--ion-color-primary);width:15px;height:15px;position:absolute;top:0;left:0;-webkit-animation:sk-cubemove 1.8s infinite ease-in-out;animation:sk-cubemove 1.8s infinite ease-in-out}.cube2{background-color:var(--ion-color-secondary);-webkit-animation-delay:-0.9s;animation-delay:-0.9s}@-webkit-keyframes sk-cubemove{25%{-webkit-transform:translateX(42px) rotate(-90deg) scale(0.5)}50%{-webkit-transform:translateX(42px) translateY(42px) rotate(-180deg)}75%{-webkit-transform:translateX(0px) translateY(42px) rotate(-270deg) scale(0.5)}100%{-webkit-transform:rotate(-360deg)}}@keyframes sk-cubemove{25%{transform:translateX(42px) rotate(-90deg) scale(0.5);-webkit-transform:translateX(42px) rotate(-90deg) scale(0.5)}50%{transform:translateX(42px) translateY(42px) rotate(-179deg);-webkit-transform:translateX(42px) translateY(42px) rotate(-179deg)}50.1%{transform:translateX(42px) translateY(42px) rotate(-180deg);-webkit-transform:translateX(42px) translateY(42px) rotate(-180deg)}75%{transform:translateX(0px) translateY(42px) rotate(-270deg) scale(0.5);-webkit-transform:translateX(0px) translateY(42px) rotate(-270deg) scale(0.5)}100%{transform:rotate(-360deg);-webkit-transform:rotate(-360deg)}}.loader{width:24px;height:80px;display:block;margin:35px auto 0;border:1px solid #FFF;border-radius:0 0 50px 50px;position:relative;box-shadow:0px 0px var(--ion-color-tertiary) inset;background-image:linear-gradient(var(--ion-color-primary) 100px, transparent 0);background-position:0px 0px;background-size:22px 80px;background-repeat:no-repeat;box-sizing:border-box;animation:animloader 6s linear infinite;will-change:background-position}.loader::after{content:'';box-sizing:border-box;top:-6px;left:50%;transform:translateX(-50%);position:absolute;border:1px solid #FFF;border-radius:50%;width:28px;height:6px}.loader::before{content:'';box-sizing:border-box;left:0;bottom:-4px;border-radius:50%;position:absolute;width:6px;height:6px;animation:animloader1 6s linear infinite;will-change:box-shadow}@keyframes animloader{0%{background-position:0px 80px}100%{background-position:0px 0px}}@keyframes animloader1{0%{box-shadow:4px -10px rgba(255, 255, 255, 0), 6px 0px rgba(255, 255, 255, 0), 8px -15px rgba(255, 255, 255, 0), 12px 0px rgba(255, 255, 255, 0)}20%{box-shadow:4px -20px rgba(255, 255, 255, 0), 8px -10px rgba(255, 255, 255, 0), 10px -30px rgba(255, 255, 255, 0.5), 15px -5px rgba(255, 255, 255, 0)}40%{box-shadow:2px -40px rgba(255, 255, 255, 0.5), 8px -30px rgba(255, 255, 255, 0.4), 8px -60px rgba(255, 255, 255, 0.5), 12px -15px rgba(255, 255, 255, 0.5)}60%{box-shadow:4px -60px rgba(255, 255, 255, 0.5), 6px -50px rgba(255, 255, 255, 0.4), 10px -90px rgba(255, 255, 255, 0.5), 15px -25px rgba(255, 255, 255, 0.5)}80%{box-shadow:2px -80px rgba(255, 255, 255, 0.5), 4px -70px rgba(255, 255, 255, 0.4), 8px -120px rgba(255, 255, 255, 0), 12px -35px rgba(255, 255, 255, 0.5)}100%{box-shadow:4px -100px rgba(255, 255, 255, 0), 8px -90px rgba(255, 255, 255, 0), 10px -120px rgba(255, 255, 255, 0), 15px -45px rgba(255, 255, 255, 0)}}.try-force-gpu{transform:translateZ(0);-webkit-transform:translateZ(0);-ms-transform:translateZ(0);will-change:transform}.dotdotdot{margin:100px auto 0;width:70px;text-align:center}.dotdotdot>div{width:18px;height:18px;background-color:var(--ion-color);border-radius:100%;display:inline-block;-webkit-animation:sk-bouncedelay 1.4s infinite ease-in-out both;animation:sk-bouncedelay 1.4s infinite ease-in-out both}.dotdotdot .bounce1{-webkit-animation-delay:-0.32s;animation-delay:-0.32s}.dotdotdot .bounce2{-webkit-animation-delay:-0.16s;animation-delay:-0.16s}@-webkit-keyframes sk-bouncedelay{0%,80%,100%{-webkit-transform:scale(0)}40%{-webkit-transform:scale(1.0)}}@keyframes sk-bouncedelay{0%,80%,100%{-webkit-transform:scale(0);transform:scale(0)}40%{-webkit-transform:scale(1.0);transform:scale(1.0)}}.ouro{position:relative;display:inline-block;height:46px;width:46px;margin:1em;border-radius:50%;background:none repeat scroll 0 0 var(--ion-color);overflow:hidden;box-shadow:0 0 10px rgba(0,0,0,.1) inset, 0 0 25px rgba(0,0,255,0.075)}.ouro:after{content:\"\";position:absolute;top:9px;left:9px;display:block;height:28px;width:28px;background:none repeat scroll 0 0 #F2F2F2;border-radius:50%;box-shadow:0 0 10px rgba(0,0,0,.1)}.ouro>span{position:absolute;height:100%;width:50%;overflow:hidden}.left{left:0}.right{left:50%}.anim{position:absolute;left:100%;top:0;height:100%;width:100%;border-radius:999px;background:none repeat scroll 0 0 var(--ion-color-primary);opacity:0.8;-webkit-animation:ui-spinner-rotate-left 3s infinite;animation:ui-spinner-rotate-left 3s infinite;-webkit-transform-origin:0 50% 0;transform-origin:0 50% 0}.left .anim{border-bottom-left-radius:0;border-top-left-radius:0}.right .anim{border-bottom-right-radius:0;border-top-right-radius:0;left:-100%;-webkit-transform-origin:100% 50% 0;transform-origin:100% 50% 0}.ouro2 .anim{-webkit-animation-delay:0s;animation-delay:0s}.ouro2 .right .anim{-webkit-animation-delay:1.5s;animation-delay:1.5s}@keyframes ui-spinner-rotate-right{0%{transform:rotate(0deg)}25%{transform:rotate(180deg)}50%{transform:rotate(180deg)}75%{transform:rotate(360deg)}100%{transform:rotate(360deg)}}@keyframes ui-spinner-rotate-left{0%{transform:rotate(0deg)}25%{transform:rotate(0deg)}50%{transform:rotate(180deg)}75%{transform:rotate(180deg)}100%{transform:rotate(360deg)}}@-webkit-keyframes ui-spinner-rotate-right{0%{-webkit-transform:rotate(0deg)}25%{-webkit-transform:rotate(180deg)}50%{-webkit-transform:rotate(180deg)}75%{-webkit-transform:rotate(360deg)}100%{-webkit-transform:rotate(360deg)}}@-webkit-keyframes ui-spinner-rotate-left{0%{-webkit-transform:rotate(0deg)}25%{-webkit-transform:rotate(0deg)}50%{-webkit-transform:rotate(180deg)}75%{-webkit-transform:rotate(180deg)}100%{-webkit-transform:rotate(360deg)}}.bubblingG{text-align:center;width:78px;height:49px;margin:auto}.bubblingG span{display:inline-block;vertical-align:middle;width:10px;height:10px;margin:24px auto;background:var(--ion-color-primary);border-radius:49px;-o-border-radius:49px;-ms-border-radius:49px;-webkit-border-radius:49px;-moz-border-radius:49px;animation:bubblingG 1s infinite alternate;-o-animation:bubblingG 1s infinite alternate;-ms-animation:bubblingG 1s infinite alternate;-webkit-animation:bubblingG 1s infinite alternate;-moz-animation:bubblingG 1s infinite alternate}#bubblingG_1{animation-delay:0s;-o-animation-delay:0s;-ms-animation-delay:0s;-webkit-animation-delay:0s;-moz-animation-delay:0s}#bubblingG_2{animation-delay:0.45s;-o-animation-delay:0.45s;-ms-animation-delay:0.45s;-webkit-animation-delay:0.45s;-moz-animation-delay:0.45s}#bubblingG_3{animation-delay:0.9s;-o-animation-delay:0.9s;-ms-animation-delay:0.9s;-webkit-animation-delay:0.9s;-moz-animation-delay:0.9s}@keyframes bubblingG{0%{width:10px;height:10px;background-color:rgb(0,0,0);transform:translateY(0)}100%{width:23px;height:23px;background-color:rgb(255,255,255);transform:translateY(-20px)}}@-o-keyframes bubblingG{0%{width:10px;height:10px;background-color:rgb(0,0,0);-o-transform:translateY(0)}100%{width:23px;height:23px;background-color:rgb(255,255,255);-o-transform:translateY(-20px)}}@-ms-keyframes bubblingG{0%{width:10px;height:10px;background-color:var(--ion-color-primary);-ms-transform:translateY(0)}100%{width:23px;height:23px;background-color:var(--ion-color-secondary);-ms-transform:translateY(-20px)}}@-webkit-keyframes bubblingG{0%{width:10px;height:10px;background-color:var(--ion-color-primary);-webkit-transform:translateY(0)}100%{width:23px;height:23px;background-color:var(--ion-color-secondary);-webkit-transform:translateY(-20px)}}@-moz-keyframes bubblingG{0%{width:10px;height:10px;background-color:var(--ion-color-primary);-moz-transform:translateY(0)}100%{width:23px;height:23px;background-color:var(--ion-color-secondary);-moz-transform:translateY(-20px)}}.bubblingG{text-align:center;width:100%;height:100%;margin:auto}.bubblingS span{display:inline-block;vertical-align:bottom;width:5px;height:5px;background:var(--ion-color-primary);border-radius:49px;animation:bubblingS 1s infinite alternate}#bubblingS_1{animation-delay:0s}#bubblingS_2{animation-delay:0.33s}#bubblingS_3{animation-delay:0.66s}@keyframes bubblingS{0%{background-color:var(--ion-color-primary);transform:translateY(0) scale(1)}100%{background-color:var(--ion-color-secondary);transform:translateY(-10px) scale(1.3)}}@keyframes pulse{0%{opacity:0}100%{opacity:1}}";

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const MultiSpinner = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.type = SUPPORTED_LOADERS.simple;
  }
  async componentWillLoad() {
    if (!this.host.isConnected)
      return;
  }
  getSimpleLoader() {
    return (h("div", { class: "spinner-simple" }, h("div", { class: "dot1" }), h("div", { class: "dot2" })));
  }
  getBubblingLoader() {
    return (h("div", { class: "bubblingG" }, h("span", { id: "bubblingG_1" }), h("span", { id: "bubblingG_2" }), h("span", { id: "bubblingG_3" })));
  }
  getBubblingSmallLoader() {
    return (h("div", { class: "ion-padding-horizontal bubblingS" }, h("span", { id: "bubblingS_1" }), h("span", { id: "bubblingS_2" }), h("span", { id: "bubblingS_3" })));
  }
  getCubeLoader() {
    return (h("div", { class: "spinner-cube" }, h("div", { class: "cube1" }), h("div", { class: "cube2" })));
  }
  getCircleLoader() {
    return (h("div", { class: "spinner-circle" }, h("div", { class: "double-bounce1" }), h("div", { class: "double-bounce2" })));
  }
  getDotsLoader() {
    return (h("div", { class: "dotdotdot" }, h("div", { class: "bounce1" }), h("div", { class: "bounce2" }), h("div", { class: "bounce3" })));
  }
  getHalfCircleLoader() {
    return (h("span", { class: "ouro ouro2" }, h("span", { class: "left" }, h("span", { class: "anim" })), h("span", { class: "right" }, h("span", { class: "anim" }))));
  }
  getMedicalLoader() {
    return (h("span", { class: "try-force-gpu loader" }));
  }
  getLoader() {
    switch (this.type) {
      case SUPPORTED_LOADERS.simple:
        return this.getSimpleLoader();
      case SUPPORTED_LOADERS.medical:
        return this.getMedicalLoader();
      case SUPPORTED_LOADERS.cube:
        return this.getCubeLoader();
      case SUPPORTED_LOADERS.circles:
        return this.getCircleLoader();
      case SUPPORTED_LOADERS.dots:
        return this.getDotsLoader();
      case SUPPORTED_LOADERS.halfCircle:
        return this.getHalfCircleLoader();
      case SUPPORTED_LOADERS.bubbling:
        return this.getBubblingLoader();
      case SUPPORTED_LOADERS.bubblingSmall:
        return this.getBubblingSmallLoader();
      default:
        throw new Error(`Unsupported loader ${this.type}`);
    }
  }
  render() {
    return (h(Host, null, this.getLoader()));
  }
  get element() { return getElement(this); }
};
__decorate([
  HostElement()
], MultiSpinner.prototype, "host", void 0);
MultiSpinner.style = multiSpinnerCss;

export { MultiSpinner as multi_spinner };

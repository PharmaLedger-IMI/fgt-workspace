var __awaiter=this&&this.__awaiter||function(t,e,r,n){function o(t){return t instanceof r?t:new r((function(e){e(t)}))}return new(r||(r=Promise))((function(r,i){function a(t){try{d(n.next(t))}catch(e){i(e)}}function s(t){try{d(n["throw"](t))}catch(e){i(e)}}function d(t){t.done?r(t.value):o(t.value).then(a,s)}d((n=n.apply(t,e||[])).next())}))};var __generator=this&&this.__generator||function(t,e){var r={label:0,sent:function(){if(i[0]&1)throw i[1];return i[1]},trys:[],ops:[]},n,o,i,a;return a={next:s(0),throw:s(1),return:s(2)},typeof Symbol==="function"&&(a[Symbol.iterator]=function(){return this}),a;function s(t){return function(e){return d([t,e])}}function d(a){if(n)throw new TypeError("Generator is already executing.");while(r)try{if(n=1,o&&(i=a[0]&2?o["return"]:a[0]?o["throw"]||((i=o["return"])&&i.call(o),0):o.next)&&!(i=i.call(o,a[1])).done)return i;if(o=0,i)a=[a[0]&2,i.value];switch(a[0]){case 0:case 1:i=a;break;case 4:r.label++;return{value:a[1],done:false};case 5:r.label++;o=a[1];a=[0];continue;case 7:a=r.ops.pop();r.trys.pop();continue;default:if(!(i=r.trys,i=i.length>0&&i[i.length-1])&&(a[0]===6||a[0]===2)){r=0;continue}if(a[0]===3&&(!i||a[1]>i[0]&&a[1]<i[3])){r.label=a[1];break}if(a[0]===6&&r.label<i[1]){r.label=i[1];i=a;break}if(i&&r.label<i[2]){r.label=i[2];r.ops.push(a);break}if(i[2])r.ops.pop();r.trys.pop();continue}a=e.call(t,r)}catch(s){a=[6,s];o=0}finally{n=i=0}if(a[0]&5)throw a[1];return{value:a[0]?a[1]:void 0,done:true}}};System.register(["./p-4a14b061.system.js","./p-43078e70.system.js","./p-eee43bf1.system.js","./p-1c52a3ad.system.js","./p-af7d7be2.system.js","./p-ce1ea776.system.js","./p-b5b01e2c.system.js","./p-ff3c9f7a.system.js"],(function(t){"use strict";var e,r,n,o,i,a,s,d,l,p,u,c,h,b,f,g;return{setters:[function(t){e=t.r;r=t.e;n=t.h;o=t.H;i=t.i},function(t){a=t.b},function(t){s=t.i;d=t.e;l=t.d;p=t.f;u=t.g;c=t.s},function(t){h=t.s},function(t){b=t.g;f=t.c},function(t){g=t.c},function(){},function(){}],execute:function(){var m=function(t,e){var r=g();var n=g();var o=t.host||t;var i=t.querySelector(".toast-wrapper");var a="calc(-10px - var(--ion-safe-area-bottom, 0px))";var s="calc(10px + var(--ion-safe-area-top, 0px))";n.addElement(i);switch(e){case"top":n.fromTo("transform","translateY(-100%)","translateY("+s+")");break;case"middle":var d=Math.floor(o.clientHeight/2-i.clientHeight/2);i.style.top=d+"px";n.fromTo("opacity",.01,1);break;default:n.fromTo("transform","translateY(100%)","translateY("+a+")");break}return r.addElement(o).easing("cubic-bezier(.155,1.105,.295,1.12)").duration(400).addAnimation(n)};var x=function(t,e){var r=g();var n=g();var o=t.host||t;var i=t.querySelector(".toast-wrapper");var a="calc(-10px - var(--ion-safe-area-bottom, 0px))";var s="calc(10px + var(--ion-safe-area-top, 0px))";n.addElement(i);switch(e){case"top":n.fromTo("transform","translateY("+s+")","translateY(-100%)");break;case"middle":n.fromTo("opacity",.99,0);break;default:n.fromTo("transform","translateY("+a+")","translateY(100%)");break}return r.addElement(o).easing("cubic-bezier(.36,.66,.04,1)").duration(300).addAnimation(n)};var v=function(t,e){var r=g();var n=g();var o=t.host||t;var i=t.querySelector(".toast-wrapper");var a="calc(8px + var(--ion-safe-area-bottom, 0px))";var s="calc(8px + var(--ion-safe-area-top, 0px))";n.addElement(i);switch(e){case"top":i.style.top=s;n.fromTo("opacity",.01,1);break;case"middle":var d=Math.floor(o.clientHeight/2-i.clientHeight/2);i.style.top=d+"px";n.fromTo("opacity",.01,1);break;default:i.style.bottom=a;n.fromTo("opacity",.01,1);break}return r.addElement(o).easing("cubic-bezier(.36,.66,.04,1)").duration(400).addAnimation(n)};var w=function(t){var e=g();var r=g();var n=t.host||t;var o=t.querySelector(".toast-wrapper");r.addElement(o).fromTo("opacity",.99,0);return e.addElement(n).easing("cubic-bezier(.36,.66,.04,1)").duration(300).addAnimation(r)};var y=":host{--border-width:0;--border-style:none;--border-color:initial;--box-shadow:none;--min-width:auto;--width:auto;--min-height:auto;--height:auto;--max-height:auto;--white-space:pre-wrap;left:0;top:0;display:block;position:absolute;width:100%;height:100%;outline:none;color:var(--color);font-family:var(--ion-font-family, inherit);contain:strict;z-index:1001;pointer-events:none}:host-context([dir=rtl]){left:unset;right:unset;right:0}:host(.overlay-hidden){display:none}:host(.ion-color){--button-color:inherit;color:var(--ion-color-contrast)}:host(.ion-color) .toast-button-cancel{color:inherit}:host(.ion-color) .toast-wrapper{background:var(--ion-color-base)}.toast-wrapper{border-radius:var(--border-radius);left:var(--start);right:var(--end);width:var(--width);min-width:var(--min-width);max-width:var(--max-width);height:var(--height);min-height:var(--min-height);max-height:var(--max-height);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);background:var(--background);-webkit-box-shadow:var(--box-shadow);box-shadow:var(--box-shadow)}[dir=rtl] .toast-wrapper,:host-context([dir=rtl]) .toast-wrapper{left:unset;right:unset;left:var(--end);right:var(--start)}.toast-container{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;pointer-events:auto;height:inherit;min-height:inherit;max-height:inherit;contain:content}.toast-content{display:-ms-flexbox;display:flex;-ms-flex:1;flex:1;-ms-flex-direction:column;flex-direction:column;-ms-flex-pack:center;justify-content:center}.toast-message{-ms-flex:1;flex:1;white-space:var(--white-space)}.toast-button-group{display:-ms-flexbox;display:flex}.toast-button{border:0;outline:none;color:var(--button-color);z-index:0}.toast-icon{font-size:1.4em}.toast-button-inner{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}@media (any-hover: hover){.toast-button:hover{cursor:pointer}}:host{--background:var(--ion-color-step-50, #f2f2f2);--border-radius:14px;--button-color:var(--ion-color-primary, #3880ff);--color:var(--ion-color-step-850, #262626);--max-width:700px;--start:10px;--end:10px;font-size:14px}.toast-wrapper{margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;display:block;position:absolute;z-index:10}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.toast-wrapper{margin-left:unset;margin-right:unset;-webkit-margin-start:auto;margin-inline-start:auto;-webkit-margin-end:auto;margin-inline-end:auto}}@supports ((-webkit-backdrop-filter: blur(0)) or (backdrop-filter: blur(0))){:host(.toast-translucent) .toast-wrapper{background:rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.8);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px)}}.toast-wrapper.toast-top{-webkit-transform:translate3d(0,  -100%,  0);transform:translate3d(0,  -100%,  0);top:0}.toast-wrapper.toast-middle{opacity:0.01}.toast-wrapper.toast-bottom{-webkit-transform:translate3d(0,  100%,  0);transform:translate3d(0,  100%,  0);bottom:0}.toast-content{padding-left:15px;padding-right:15px;padding-top:15px;padding-bottom:15px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.toast-content{padding-left:unset;padding-right:unset;-webkit-padding-start:15px;padding-inline-start:15px;-webkit-padding-end:15px;padding-inline-end:15px}}.toast-header{margin-bottom:2px;font-weight:500}.toast-button{padding-left:15px;padding-right:15px;padding-top:10px;padding-bottom:10px;height:44px;-webkit-transition:background-color, opacity 100ms linear;transition:background-color, opacity 100ms linear;border:0;background-color:transparent;font-family:var(--ion-font-family);font-size:17px;font-weight:500;overflow:hidden}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.toast-button{padding-left:unset;padding-right:unset;-webkit-padding-start:15px;padding-inline-start:15px;-webkit-padding-end:15px;padding-inline-end:15px}}.toast-button.ion-activated{opacity:0.4}@media (any-hover: hover){.toast-button:hover{opacity:0.6}}";var k=":host{--border-width:0;--border-style:none;--border-color:initial;--box-shadow:none;--min-width:auto;--width:auto;--min-height:auto;--height:auto;--max-height:auto;--white-space:pre-wrap;left:0;top:0;display:block;position:absolute;width:100%;height:100%;outline:none;color:var(--color);font-family:var(--ion-font-family, inherit);contain:strict;z-index:1001;pointer-events:none}:host-context([dir=rtl]){left:unset;right:unset;right:0}:host(.overlay-hidden){display:none}:host(.ion-color){--button-color:inherit;color:var(--ion-color-contrast)}:host(.ion-color) .toast-button-cancel{color:inherit}:host(.ion-color) .toast-wrapper{background:var(--ion-color-base)}.toast-wrapper{border-radius:var(--border-radius);left:var(--start);right:var(--end);width:var(--width);min-width:var(--min-width);max-width:var(--max-width);height:var(--height);min-height:var(--min-height);max-height:var(--max-height);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);background:var(--background);-webkit-box-shadow:var(--box-shadow);box-shadow:var(--box-shadow)}[dir=rtl] .toast-wrapper,:host-context([dir=rtl]) .toast-wrapper{left:unset;right:unset;left:var(--end);right:var(--start)}.toast-container{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;pointer-events:auto;height:inherit;min-height:inherit;max-height:inherit;contain:content}.toast-content{display:-ms-flexbox;display:flex;-ms-flex:1;flex:1;-ms-flex-direction:column;flex-direction:column;-ms-flex-pack:center;justify-content:center}.toast-message{-ms-flex:1;flex:1;white-space:var(--white-space)}.toast-button-group{display:-ms-flexbox;display:flex}.toast-button{border:0;outline:none;color:var(--button-color);z-index:0}.toast-icon{font-size:1.4em}.toast-button-inner{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}@media (any-hover: hover){.toast-button:hover{cursor:pointer}}:host{--background:var(--ion-color-step-800, #333333);--border-radius:4px;--box-shadow:0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);--button-color:var(--ion-color-primary, #3880ff);--color:var(--ion-color-step-50, #f2f2f2);--max-width:700px;--start:8px;--end:8px;font-size:14px}.toast-wrapper{margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;display:block;position:absolute;opacity:0.01;z-index:10}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.toast-wrapper{margin-left:unset;margin-right:unset;-webkit-margin-start:auto;margin-inline-start:auto;-webkit-margin-end:auto;margin-inline-end:auto}}.toast-content{padding-left:16px;padding-right:16px;padding-top:14px;padding-bottom:14px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.toast-content{padding-left:unset;padding-right:unset;-webkit-padding-start:16px;padding-inline-start:16px;-webkit-padding-end:16px;padding-inline-end:16px}}.toast-header{margin-bottom:2px;font-weight:500;line-height:20px}.toast-message{line-height:20px}.toast-button-group-start{margin-left:8px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.toast-button-group-start{margin-left:unset;-webkit-margin-start:8px;margin-inline-start:8px}}.toast-button-group-end{margin-right:8px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.toast-button-group-end{margin-right:unset;-webkit-margin-end:8px;margin-inline-end:8px}}.toast-button{padding-left:15px;padding-right:15px;padding-top:10px;padding-bottom:10px;position:relative;background-color:transparent;font-family:var(--ion-font-family);font-size:14px;font-weight:500;letter-spacing:0.84px;text-transform:uppercase;overflow:hidden}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.toast-button{padding-left:unset;padding-right:unset;-webkit-padding-start:15px;padding-inline-start:15px;-webkit-padding-end:15px;padding-inline-end:15px}}.toast-button-cancel{color:var(--ion-color-step-100, #e6e6e6)}.toast-button-icon-only{border-radius:50%;padding-left:9px;padding-right:9px;padding-top:9px;padding-bottom:9px;width:36px;height:36px}@supports ((-webkit-margin-start: 0) or (margin-inline-start: 0)) or (-webkit-margin-start: 0){.toast-button-icon-only{padding-left:unset;padding-right:unset;-webkit-padding-start:9px;padding-inline-start:9px;-webkit-padding-end:9px;padding-inline-end:9px}}@media (any-hover: hover){.toast-button:hover{background-color:rgba(var(--ion-color-primary-rgb, 56, 128, 255), 0.08)}.toast-button-cancel:hover{background-color:rgba(var(--ion-background-color-rgb, 255, 255, 255), 0.08)}}";var T=t("ion_toast",function(){function t(t){var n=this;e(this,t);this.didPresent=r(this,"ionToastDidPresent",7);this.willPresent=r(this,"ionToastWillPresent",7);this.willDismiss=r(this,"ionToastWillDismiss",7);this.didDismiss=r(this,"ionToastDidDismiss",7);this.presented=false;this.duration=0;this.keyboardClose=false;this.position="bottom";this.translucent=false;this.animated=true;this.dispatchCancelHandler=function(t){var e=t.detail.role;if(s(e)){var r=n.getButtons().find((function(t){return t.role==="cancel"}));n.callButtonHandler(r)}}}t.prototype.connectedCallback=function(){d(this.el)};t.prototype.present=function(){return __awaiter(this,void 0,void 0,(function(){var t=this;return __generator(this,(function(e){switch(e.label){case 0:return[4,l(this,"toastEnter",m,v,this.position)];case 1:e.sent();if(this.duration>0){this.durationTimeout=setTimeout((function(){return t.dismiss(undefined,"timeout")}),this.duration)}return[2]}}))}))};t.prototype.dismiss=function(t,e){if(this.durationTimeout){clearTimeout(this.durationTimeout)}return p(this,t,e,"toastLeave",x,w,this.position)};t.prototype.onDidDismiss=function(){return u(this.el,"ionToastDidDismiss")};t.prototype.onWillDismiss=function(){return u(this.el,"ionToastWillDismiss")};t.prototype.getButtons=function(){var t=this.buttons?this.buttons.map((function(t){return typeof t==="string"?{text:t}:t})):[];return t};t.prototype.buttonClick=function(t){return __awaiter(this,void 0,void 0,(function(){var e,r;return __generator(this,(function(n){switch(n.label){case 0:e=t.role;if(s(e)){return[2,this.dismiss(undefined,e)]}return[4,this.callButtonHandler(t)];case 1:r=n.sent();if(r){return[2,this.dismiss(undefined,e)]}return[2,Promise.resolve()]}}))}))};t.prototype.callButtonHandler=function(t){return __awaiter(this,void 0,void 0,(function(){var e,r;return __generator(this,(function(n){switch(n.label){case 0:if(!(t&&t.handler))return[3,4];n.label=1;case 1:n.trys.push([1,3,,4]);return[4,c(t.handler)];case 2:e=n.sent();if(e===false){return[2,false]}return[3,4];case 3:r=n.sent();console.error(r);return[3,4];case 4:return[2,true]}}))}))};t.prototype.renderButtons=function(t,e){var r;var o=this;if(t.length===0){return}var i=a(this);var s=(r={"toast-button-group":true},r["toast-button-group-"+e]=true,r);return n("div",{class:s},t.map((function(t){return n("button",{type:"button",class:_(t),tabIndex:0,onClick:function(){return o.buttonClick(t)},part:"button"},n("div",{class:"toast-button-inner"},t.icon&&n("ion-icon",{icon:t.icon,slot:t.text===undefined?"icon-only":undefined,class:"toast-icon"}),t.text),i==="md"&&n("ion-ripple-effect",{type:t.icon!==undefined&&t.text===undefined?"unbounded":"bounded"}))})))};t.prototype.render=function(){var t,e;var r=this.getButtons();var i=r.filter((function(t){return t.side==="start"}));var s=r.filter((function(t){return t.side!=="start"}));var d=a(this);var l=(t={"toast-wrapper":true},t["toast-"+this.position]=true,t);return n(o,{style:{zIndex:""+(6e4+this.overlayIndex)},class:f(this.color,Object.assign(Object.assign((e={},e[d]=true,e),b(this.cssClass)),{"toast-translucent":this.translucent})),tabindex:"-1",onIonToastWillDismiss:this.dispatchCancelHandler},n("div",{class:l},n("div",{class:"toast-container",part:"container"},this.renderButtons(i,"start"),n("div",{class:"toast-content"},this.header!==undefined&&n("div",{class:"toast-header",part:"header"},this.header),this.message!==undefined&&n("div",{class:"toast-message",part:"message",innerHTML:h(this.message)})),this.renderButtons(s,"end"))))};Object.defineProperty(t.prototype,"el",{get:function(){return i(this)},enumerable:false,configurable:true});return t}());var _=function(t){var e;return Object.assign((e={"toast-button":true,"toast-button-icon-only":t.icon!==undefined&&t.text===undefined},e["toast-button-"+t.role]=t.role!==undefined,e["ion-focusable"]=true,e["ion-activatable"]=true,e),b(t.cssClass))};T.style={ios:y,md:k}}}}));
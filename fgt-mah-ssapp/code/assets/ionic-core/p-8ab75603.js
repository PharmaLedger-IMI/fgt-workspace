import{c as t}from"./p-3df3e749.js";import{h as o,a as e,b as n}from"./p-a96dd2bf.js";import{createGesture as r}from"./p-a013b234.js";const a=(a,s)=>{let d,i;const c=(t,o,e)=>{if("undefined"==typeof document)return;const n=document.elementFromPoint(t,o);n&&s(n)?n!==d&&(m(),f(n,e)):m()},f=(o,e)=>{d=o,i||(i=d);const n=d;t((()=>n.classList.add("ion-activated"))),e()},m=(o=!1)=>{if(!d)return;const e=d;t((()=>e.classList.remove("ion-activated"))),o&&i!==d&&d.click(),d=void 0};return r({el:a,gestureName:"buttonActiveDrag",threshold:0,onStart:t=>c(t.currentX,t.currentY,e),onMove:t=>c(t.currentX,t.currentY,n),onEnd:()=>{m(!0),o(),i=void 0}})};export{a as c}
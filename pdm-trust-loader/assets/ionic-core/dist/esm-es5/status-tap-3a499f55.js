import{f as readTask,c as writeTask}from "./index-3ccd7557.js";import{c as componentOnReady}from "./helpers-dd7e4b7b.js";var startStatusTap=function(){var n=window;n.addEventListener("statusTap",(function(){readTask((function(){var t=n.innerWidth;var e=n.innerHeight;var r=document.elementFromPoint(t/2,e/2);if(!r){return}var a=r.closest("ion-content");if(a){new Promise((function(n){return componentOnReady(a,n)})).then((function(){writeTask((function(){return a.scrollToTop(300)}))}))}}))}))};export{startStatusTap};
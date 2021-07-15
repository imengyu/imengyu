import './assets/sass/main.scss'
import './utils/Extends'
import App from './App.vue'
import { createRouter } from './router'
import Vue from 'vue';

const version = '20210516';

let bus : Vue = null;

function doInitVue() {
  bus = new Vue({
    el: '#imengyu-app',
    render: h => h(App),
    router: createRouter()
  });
}

//静态css 样式
var staticCss = [
  'animate.min.css',
  'iconfont.min.css'
];
//静态js
var staticJs = [
];

function doLoadAll() { 
  staticCss.forEach((n) => doLoadCss(n));
  
  let loadJsCurrent = 0;
  let loadJs = () => {
    if(loadJsCurrent < staticJs.length) {
      doLoadJs(staticJs[loadJsCurrent], () => loadJs())
      loadJsCurrent++;
    }else {
      doInitVue();
    }
  }

  loadJs();

  console.log(`%cVersion%c${version}`, 'color:#fff;background:#000;padding:3px 6px', 'color:#fff;background:#56a;padding:3px 6px');
}
function doLoadCss(name) {
  var s = s=document.createElement("link");
  s.rel="stylesheet";
  s.type="text/css";
  s.href="./static/" + name;
  document.body.appendChild(s);
}
function doLoadJs(name, callback) {
  var script = document.createElement("script");
  script.onload = function() { callback(); };
  script.type="text/javascript";
  script.src="./static/" + name;
  document.body.appendChild(script);
}

doLoadAll();

export { bus }
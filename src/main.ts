import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/sass/main.scss'
import './utils/Extends'
import Const from './const/Const'
import { doLoadAll } from './utils/StaticLoader'
import mitt from 'mitt'

console.log(`%cVersion%c${Const.Version}`, 'color:#fff;background:#000;padding:3px 6px', 'color:#fff;background:#56a;padding:3px 6px');

console.log(`%c有1吗？会写代码的小受受不知道有没有人要（＞人＜；）`, 'color:#fff;background:#000;padding:3px 6px');

export const emitter = mitt()

doLoadAll()

createApp(App)
  .use(router)
  .mount('#imengyu-app')


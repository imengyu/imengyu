import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/sass/main.scss'
import './utils/Extends'
import Const from './const/Const'
import { doLoadAll } from './utils/StaticLoader'
import mitt from 'mitt'

console.log(`%cVersion%c${Const.Version}`, 'color:#fff;background:#000;padding:3px 6px', 'color:#fff;background:#56a;padding:3px 6px');

export const emitter = mitt()

doLoadAll()

createApp(App).use(store).use(router).mount('#imengyu-app')


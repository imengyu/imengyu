import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Index from '../views/Index.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Index',
    component: Index,
    children: [
      {
        path: 'About',
        name: 'About',
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
      },
      {
        path: 'Works',
        name: 'Works',
        component: () => import(/* webpackChunkName: "works" */ '../views/Works.vue'),
      },
    ]
  },
  {
    path: '/404',
    name: 'PageNotExist',
    component: () => import(/* webpackChunkName: "notfoud" */ '../views/NotFound.vue')
  },
  {
    path: "/:catchAll(.*)", // 不识别的path自动匹配404
    redirect: '/404',
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

export default router

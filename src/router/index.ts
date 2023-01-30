import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Index from '../views/Index.vue';
import About from '../views/About.vue';
import Works from '../views/Works.vue';
import NotFound from '../views/NotFound.vue';
import Test from '../views/Test.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Index',
    component: Index,
    children: [
      {
        path: 'About',
        name: 'About',
        component: About,
      },
      {
        path: 'Works',
        name: 'Works',
        component: Works,
      },
    ]
  },
  {
    path: '/Test',
    name: 'Test',
    component: Test
  },
  {
    path: '/404',
    name: 'PageNotExist',
    component: NotFound
  },
  {
    path: "/:catchAll(.*)", // 不识别的path自动匹配404
    redirect: '/404',
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

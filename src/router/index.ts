import VueRouter from 'vue-router';
import Vue from 'vue';

Vue.use(VueRouter);

export function createRouter() {
  return new VueRouter({
    mode: 'hash',
    routes: [
      {
        path: '/',
        name: 'Index',
        component: () => import('../views/Index.vue'),
        children: [
          {
            path: 'About',
            name: 'About',
            component: () => import('../views/About.vue'),
          },
          {
            path: 'Works',
            name: 'Works',
            component: () => import('../views/Works.vue'),
          },
        ]
      },
      {
        path: '*',
        name: 'NotFound',
        component: () => import('../views/NotFound.vue')
      }
    ]
  });
}

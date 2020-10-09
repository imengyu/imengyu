import NotFound from '../views/NotFound.vue';
import Index from '../views/Index.vue';
import About from '../views/About.vue';
import Works from '../views/Works.vue';

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
        component: Index,
        children: [
          {
            path: 'About',
            name: 'About',
            component: About
          },
          {
            path: 'Works',
            name: 'Works',
            component: Works
          },
        ]
      },
      {
        path: '*',
        name: 'NotFound',
        component: NotFound
      }
    ]
  });
}

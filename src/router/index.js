import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '*',
    redirect: {
      name: 'home',
    },
  },
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "daily-metrics" */ '../views/Home.vue'),
  },
];

const router = new VueRouter({
  routes,
});

export default router;

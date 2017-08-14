import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './components/App.vue'
import NewsList from './components/NewsList.vue'
import store from './store/index'

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: NewsList },
    { path: '/:category', component: NewsList, props: true }
  ],
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})

new Vue({
  router,
  store,
  render: createEle => createEle(App)
}).$mount('#app')
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './components/App.vue'
import NewsList from './components/NewsList.vue'
import store from './store/index'

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    { path: '/', component: NewsList },
    { path: '/:category', component: NewsList }
  ]
})

new Vue({
  router,
  store,
  render: createEle => createEle(App)
}).$mount('#app')
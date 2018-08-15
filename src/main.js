import Vue from 'vue'
import VueRouter from 'vue-router'
import VueX from 'vuex'
import VuexPersistedState from 'vuex-persist'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue'
import Dashboard from './components/Dashboard.vue'

Vue.use(VueRouter)
Vue.use(BootstrapVue)

const routes = [{
  path: '/',
  name: 'Dashboard',
  component: Dashboard
}]

const router = new VueRouter({
  routes
});

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})


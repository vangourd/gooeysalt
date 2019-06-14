import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue'
import Minions from './Minions.vue'
import Jobs from './Jobs.vue'
import States from './States.vue'
import Login from './Login.vue'
import { auth, jobs, minions, statefiles } from './store'
import AUTH_CONFIG from './config.json'

Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(BootstrapVue)

const store = new Vuex.Store({
  modules: {
    auth: auth,
    jobs: jobs,
    minions: minions,
    statefiles: statefiles,
  },
})

const routes = [{
  path: '/',
  redirect: {path: '/minions'}
}, {
  path:'/login',
  name: 'login',
  component: Login
}, {
  path: '/minions/:minion?',
  name: 'minions',
  component: Minions,
  props: true
}, {
  path: '/jobs/:jid?',
  name: 'jobs',
  component: Jobs,
  props: true
}, {
  path: '/states/:state?',
  name: 'states',
  component: States,
  props: true
}]

const router = new VueRouter({
  routes
});

router.beforeEach((to, from ,next) => {
  if(to.name === 'login'){ 
    next() 
  }
  if(auth.state.authorized === true){ next() }
  else { next('login') }


})

auth.mutations.applyConfig(auth.state,{
  server: AUTH_CONFIG.server,
  port: AUTH_CONFIG.port,
  eauth: AUTH_CONFIG.eauth 
})
          
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
})

export { router };
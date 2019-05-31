import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue'
import Minions from './Minions.vue'
import Jobs from './Jobs.vue'
import States from './States.vue'
import Login from './Login.vue'
import Logout from './Logout.vue'
import { auth, jobs, minions, statefiles } from './store'

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
  path:'/logout',
  name: 'logout',
  component: Logout
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

window.onbeforeunload = function() {
  if(auth.status === true){
    localStorage.setItem('auth',JSON.stringify(auth.export()))
  }
}

/*var store = {
  debug: 'debug',
  state: {
    current_view: 'jobs'
  },
}*/

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
  created() {
    if (!this.$store.state.auth.status){
        this.$router.push({'path':'/minions'})
    }
    this.$router.push({'path':'/login'})
  },
})

export { router };
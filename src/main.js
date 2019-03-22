import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue'
import { Auth } from 'src/salt/'
import Minions from './Minions.vue'
import Jobs from './Jobs.vue'
import States from './States.vue'
import Login from './Login.vue'
import Logout from './Logout.vue'

Vue.use(VueRouter)
Vue.use(BootstrapVue)

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


var store = {
  debug: 'debug',
  state: {
    current_view: 'jobs'
  },
}

new Vue({
  el: '#app',
  router,
  render: h => h(App),
  data: {
    auth: new Auth(),
  },
  methods: {
    loadFromStorage: function(){
      console.debug('loadFromStorage ')
      let fromStorage = JSON.parse(localStorage.getItem('auth'))
      if(fromStorage){
        this.auth.import(fromStorage)
        return true
      }
      return false
    }
  },
  created() {
    if (!this.auth.status){
      if(this.loadFromStorage){
        this.$router.push({'path':'/minions'})
      }
    }
    this.$router.push({'path':'/login'})
  }
})


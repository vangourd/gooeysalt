import Vue from 'vue'
import VueRouter from 'vue-router'
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

// STATE Object

var store = {
  debug: 'debug',
  state: {
    auth: {
      'status': false,
      'server': null,
      'port': null,
      'eauth': null,
      'token': null,
      'perms': null,
      'username': null,
      'expire' : 0,
      'message': 'Disconnected',
      'short_message': 'Disconnected',
      'variant': 'secondary'
    },
    current_view: 'jobs'
  },
  setAuth: function(token,username,expire,perms){
    this.state.auth.status = true
    this.state.auth.token = token
    this.state.auth.username = username
    // Transforming expiration parameter
    this.state.auth.expire = (expire * 1000).toString().slice(0,13)
    this.state.auth.perms = perms
    this.state.auth.message = "Connected to " + this.state.auth.server +
                                  ' as ' + this.state.auth.username
    this.state.auth.variant = 'success'
    this.state.auth.short_message = "Connected"
    localStorage.setItem('auth', JSON.stringify(this.state.auth))
  },
  clearAuth: function() {
    this.state.auth.status = false,
    this.state.auth.token = null,
    this.state.auth.username = null,
    this.state.expire = null,
    this.state.auth.perms = null,
    this.state.auth.message = "Disconnected",
    this.state.auth.variant = 'secondary',
    this.state.auth.short_message = "Disconnected"
    localStorage.clear()
  },
  initAuth: function() {
    // Loading state from local storage for persistence
    if (localStorage.getItem('auth')){
      let startupstate = JSON.parse(localStorage.getItem('auth'))
      // Debug log state returning from local storage
      console.debug(startupstate)
      // Test for token expiration
      if (Date.now() < startupstate.expire){
        console.log('Token expiration pass')
        this.state.auth = startupstate
      }
      else {
        console.log('Token expired')
        localStorage.clear()
      }
    }
    else {
      console.debug('No local state stored')
    }
  }
}

new Vue({
  el: '#app',
  router,
  render: h => h(App),
  data: {
    sharedState: store,
  }
})


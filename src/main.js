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
      'variant': 'secondary'
    }
  },
  isAuth: function() {
    if (this.state.auth.status == true) {
      return true
    }
  },
  setAuth: function(token,username,expire,perms){
    this.state.auth.status = true
    this.state.auth.token = token
    this.state.auth.username = username
    this.state.auth.expire = expire
    this.state.auth.perms = perms
    this.state.auth.message = "Connected to " + this.state.auth.server +
                                  ' as ' + this.state.auth.username
    this.state.auth.variant = 'success'
    localStorage.setItem('auth', JSON.stringify(this.state.auth))
  },
  initAuth: function() {
    let startupstate = JSON.parse(localStorage.getItem('state'))
    if (startupstate.auth.expire > Date.now() ){
      this.state.auth = startupstate
    }
    // Else populate state
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


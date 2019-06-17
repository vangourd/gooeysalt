import Vuex from 'vuex'
import BootstrapVue from 'bootstrap-vue'
import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Login from '../../src/Login.vue'
import stubs from './stubs.json'
import AUTH_CONFIG from '../../src/config.json'
import axios from 'axios'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(BootstrapVue)

const mockExpiration = Date.now() + Math.pow(20,9)

const mockAuthInfo = {
    status: 200, 
    data: {
      return: [{
        token: 444037494798175240000,
        expire: mockExpiration,
        perms: ['*all']
    }]
  }   
} 

jest.mock("axios", () => ({
    post: jest.fn((_url, _body) => Promise.resolve( mockAuthInfo )),
}));

const ex_auth = {
  connected: false,
  waiting: false,
  authorized: false,
  interval: null,
  token: null,
  expire: null,
  perms: null,
  username: 'user',
  server: AUTH_CONFIG.server,
  port: AUTH_CONFIG.port,
  eauth: AUTH_CONFIG.eauth,
}

describe('Login.vue', () => {

  beforeAll(() => {
    axios.post.mockClear()
  });

  it('renders a login prompt', () => {

    let store = new Vuex.Store({
      state: {
        auth: ex_auth
      }
    })

    const wrapper = shallowMount(Login, {
      store, 
      localVue,
      stubs
    });
    let el = wrapper.findAll('b-btn-stub').at(1)
    expect(el.text()).toBe("Login")
  })
  it('turns test button to "Fail" text and color to red if api request failure', async () => {
    const localAuth = {...ex_auth}
    localAuth.authorized = false

    const wrapper = mount(Login, {
      localVue,
      mocks: {
        $router: {
          push: jest.fn()
        },
        $store: {
          commit: jest.fn() ,
          dispatch: jest.fn((server, port) => 
            Promise.resolve()
          ),
          state: {
            auth: localAuth
          }
        },
      }
    })
    const btn = wrapper.find({ ref: 'ping'})
    btn.trigger('click')
    expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith('serverPing', {"port":ex_auth.port, "server": ex_auth.server})
    await flushPromises()
    expect(wrapper.vm.ping.variant).toBe("danger")
    expect(wrapper.vm.ping.text).toBe("Failed")
  })
  it('turns test button text to "Success" and color to green if api request succeeded', async () => {
    const localAuth = {...ex_auth}
    localAuth.authorized = false

    const wrapper = mount(Login, {
      localVue,
      mocks: {
        $router: {
          push: jest.fn()
        },
        $store: {
          commit: jest.fn() ,
          dispatch: jest.fn((server, port) => 
            Promise.resolve(true)
          ),
          state: {
            auth: localAuth
          }
        },
      }
    })
    const btn = wrapper.find({ ref: 'ping'})
    btn.trigger('click')
    expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith('serverPing', {"port":ex_auth.port, "server": ex_auth.server})
    await flushPromises()
    expect(wrapper.vm.ping.variant).toBe("success")
    expect(wrapper.vm.ping.text).toBe("Success")
  })
  it('sends a proper authentication msg', async () => {
    const localAuth = {...ex_auth}
    localAuth.authorized = false

    const wrapper = mount(Login, {
      localVue,
      mocks: {
        $router: {
          push: jest.fn()
        },
        $store: {
          commit: jest.fn() ,
          dispatch: jest.fn() ,
          state: {
            auth: localAuth
          }
        },
      }
    })

    const mockParams = {
      username: 'user',
      password: 'pass',
      server: 'server.com',
      port: '1234',
      eauth: 'pam'
    }
    
    wrapper.setData( mockParams )
    //wrapper.find("#loginbtn").trigger("click")
    wrapper.vm.authenticate()
    await flushPromises()
    expect(axios.post).toHaveBeenCalledWith('https://server.com:1234/login', {
      username: mockParams.username,
      password: mockParams.password,
      eauth: mockParams.eauth
    })
  })
  it('commits the results from login to state', async () => {
    const localAuth = {...ex_auth}
    localAuth.authorized = false

    const wrapper = mount(Login, {
      localVue,
      mocks: {
        $router: {
          push: jest.fn()
        },
        $store: {
          commit: jest.fn() ,
          dispatch: jest.fn() ,
          state: {
            auth: localAuth
          }
        },
      }
    })

    const mockParams = {
      username: 'user',
      password: 'pass',
      server: 'server.com',
      port: '1234',
      eauth: 'pam'
    }
    
    wrapper.setData( mockParams )
    //wrapper.find("#loginbtn").trigger("click")
    wrapper.vm.authenticate()
    await flushPromises()
    expect(wrapper.vm.$store.commit).toHaveBeenCalledWith('sessionUpdate', {
      username: mockParams.username,
      eauth: mockParams.eauth,
      token: mockAuthInfo.data.return[0].token,
      expire: mockAuthInfo.data.return[0].expire,
      perms: mockAuthInfo.data.return[0].perms
    })
  })

})
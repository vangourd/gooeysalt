import Vuex from 'vuex'
import BootstrapVue from 'bootstrap-vue'
import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { auth } from '../../src/store/auth.js'
import Login from '../../src/Login.vue'
import { doesNotReject } from 'assert';
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

const stubs = {
  'b-container': true,
  'b-btn': true,
  'b-navbar':true,
  'b-row': true,
  'b-navbar-toggle': true,
  'b-navbar-brand': true,
  'b-col': true,
  'b-form-group': true,
  'b-input': true,
  'b-form-select': true
}

const ex_auth = {
  connected: false,
  waiting: false,
  authorized: false,
  interval: null,
  token: null,
  expire: null,
  perms: null,
  username: 'user',
  server: "salt.sfb.osaa.net",
  port: "8000",
  eauth: "auto",
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

  it('redirects if you are authenticated', () => {

    let good_auth = {...ex_auth}
    good_auth.authorized = true

    let store = new Vuex.Store({
      state: {
        auth: good_auth
      }
    })

    const wrapper = shallowMount(Login, {
      store,
      localVue,
      stubs,
      mocks: {
        $router: {
          push: jest.fn()
        }
      },
    })

    expect(wrapper.vm.$router.push).toBeCalledWith('minions')
  })

  it('it does not redirect if you are unauthenticated', () => {

    let bad_auth = {...ex_auth}
    bad_auth.authorized = false

    let store = new Vuex.Store({
      state: {
        auth: bad_auth
      }
    })

    const wrapper = shallowMount(Login, {
      store,
      localVue,
      stubs,
      mocks: {
        $router: {
          push: jest.fn()
        }
      },
    })


    expect(wrapper.vm.$router.push).not.toBeCalledWith('minions')
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
    expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith('serverPing', {"port":"8000", "server": "salt"})
    await flushPromises()
    expect(wrapper.vm.ping.variant).toBe("danger")
    expect(wrapper.vm.ping.text).toBe("Failed")
  })
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
    expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith('serverPing', {"port":"8000", "server": "salt"})
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


import Vuex from 'vuex'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import App from '../../src/App.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('App.vue', () => {
    it('tries to load cached auth from localStorage', () => {
        let state = {
            auth: {
                authorized: true,
            }
        }

        const wrapper = shallowMount(App, {
            localVue,
            stubs: {
                "router-view": true
            },
            mocks: {
                $store: {
                    state,
                    dispatch: jest.fn(),
                    commit: jest.fn()
                }
            }
        });
        
        expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith('loadAuthFromStorage')
    })
})
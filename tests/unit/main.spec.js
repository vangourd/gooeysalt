jest.mock('vue')
jest.mock('vuex')
jest.mock('vue-router')
jest.mock('bootstrap-vue', () => {
    return function() {
        return { test: () => {

        }}
    }
})
jest.mock('../../src/store/', () => {
    return {
        auth: {
            state: {},
            mutations: {
                applyConfig: jest.fn()
            }
        }
    }
})

jest.mock('../../src/config.json', () => {
    return {
        server: 'server',
        port: 'port',
        eauth: 'eauth'
    }
})

import main from '../../src/main.js'
import { auth } from '../../src/store/'


describe('main.js',() => {
    it('loads config from file and commits it to state', () => {
        expect(auth.mutations.applyConfig).toHaveBeenCalledWith({},{
            server:'server',
            port: 'port',
            eauth: 'eauth',
        })
    })
})
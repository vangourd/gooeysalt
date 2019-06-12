import { auth } from '../../src/store/auth.js'
import { router } from '../../src/main.js'
import config from '../../src/config.json'

jest.mock('../../src/main.js', () => ({
    _esModule: true,
    default: 'mockedRouter',
    router: {
        push: jest.fn((_target) => {return true})
    }
}));

 var localStorageMock = (function() {
    return {
        setItem: jest.fn(),
        clear: jest.fn()
    };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('Auth.js', () => {
    it('routes user back to login page when logout function is called', () => {
        let context = {
            commit: jest.fn()
        }
        auth.actions.logout(context)
        expect(router.push).toHaveBeenCalledWith('login')
        expect(context.commit).toHaveBeenCalledWith('sessionClear')
    })
    it('commits authentication information when sessionUpdate function is called', () => {
        let example_auth = {
            token: null,
            expire: null,
            perms: null,
            username: 'user',
            eauth: "auto",
        }
        let state = {
            server: config.server,
            port: config.port,
            connected: false,
            authorized: false,
            interval: null,
        }
        auth.mutations.sessionUpdate(state, example_auth)
        let expected_state = {...state, ...example_auth}
        expected_state.authorized = true
        expected_state.connected = true
        expect(state).toEqual(expected_state)
    })
    it('commits auth to storage', () => {
        let ex_auth = {
            connected: false,
            waiting: false,
            authorized: false,
            interval: null,
            token: null,
            expire: null,
            perms: null,
            username: 'user',
            server: config.server,
            port: config.port,
            eauth: "auto",
        }
        auth.mutations.commitAuthToStorage(ex_auth)
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth', JSON.stringify(ex_auth))
    })
    it('clears authentication information when sessionClear function is called', () => {
        let state = {
            connected: true,
            authorized: true,
            token: 'as9df7a983u98asdf098asudf',
            expire: 232342783872352,
            perms: '*all',
        }
        auth.mutations.sessionClear(state)
        expect(state).toEqual({
            connected: null,
            authorized: null,
            token: null,
            expire: null,
            perms: null,
        })
        expect(localStorageMock.clear).toHaveBeenCalled()
    })
})

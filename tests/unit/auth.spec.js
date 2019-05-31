import { auth } from '../../src/store/auth.js'
import { router } from '../../src/main.js'

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
        let ex_auth = {
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
        let state = {}
        auth.mutations.sessionUpdate(state, ex_auth)
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth', JSON.stringify(state))
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

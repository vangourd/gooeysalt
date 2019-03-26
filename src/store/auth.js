import axios from 'axios'

export const auth = {
    state: {
        connected: false,
        authorized: false,
        interval: null,
        token: null,
        expire: null,
        perms: null,
        username: 'user',
        server: "salt.sfb.osaa.net",
        port: "8000",
        eauth: "auto",
    },
    mutations: {
        sessionUpdate (state, data) {
            console.debug('session update')
            console.debug(data)
            state.connected = true
            state.authorized = true
            state.username = data.username
            state.eauth = data.eauth
            state.token = data.token
            state.expire = data.expire
            state.perms = data.perms
            localStorage.setItem('auth', JSON.stringify(state))
        },
        sessionClear (state) {
            state.connected = state.authorized = state.token = state.expire = state.perms = null
        },
        serverUp (state) {
            state.connected = true
        },
        serverDown (state) {
            state.connected = false
        },
        storeInterval (state, int) {
            clearInterval(state.interval)
            state.interval = int
        },
        loadAuthFromStorage (state,local) {
            state.connected = local.connected
            state.authorized = local.authorized
            state.username = local.username
            state.token = local.token
            state.expire = local.expire
            state.perms = local.perms
        }
    },
    actions: {
        serverHeartBeat(context) {
            context.dispatch('serverCheck')
            context.commit('storeInterval',setInterval(() => {
                context.dispatch('serverCheck')
            },5000)
            )
        },
        serverCheck (context,data) {
            context.dispatch('serverPing',{
                'server': context.state.server,
                'port': context.state.port
            })
            .then((response) => {
                if(response){
                    context.commit('serverUp')
                }
                else{
                    context.commit('serverDown')
                }
            })
            .catch((err) => {
                console.debug(err)
                context.commit('serverDown')
            })
        },
        serverPing (context, data) {
            return axios.get('https://' + data.server + 
                            ':' + data.port + '/')
        },
    }
}

import axios from 'axios'

export const auth = {
    state: {
        connected: false,
        str_status: 'not connected',
        authorized: false,
        token: null,
        expire: null,
        perms: null,
        server: "salt.sfb.osaa.net",
        port: "8000",
        eauth: "auto",
    },
    mutations: {
        authorize (state, data) {
            state.connected = true
            state.authorized = true
            state.token = data.token
            state.expire = data.expire
            state.perms = data.perms
        },
        serverUp (state) {
            state.connected = true
        },
        serverDown (state) {
            state.connected = false
        }
    },
    actions: {
        serverPing(context) {
            return axios.get('https://' + context.state.server + 
                            ':' + context.state.port + '/')
            .then((response) => {
                if(response){
                    context.commit('serverUp')
                }
            })
            .catch((error) => {
                console.debug(error)
                context.commit('serverDown')
            })
        },
        serverHeartBeat(context) {
            context.dispatch('serverPing')
            setInterval(() => {
                context.dispatch('serverPing')
            },5000)
        }
    }
}

import axios from 'axios'
import { router } from '../main.js'

export const auth = {
    state: {
        connected: false,
        authorized: false,
        interval: null,
        token: null,
        expire: null,
        perms: null,
        username: 'user',
        server: "salt",
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
        },
        sessionClear (state) {
            state.connected = state.authorized = state.token = state.expire = state.perms = null
            localStorage.clear()
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
        commitAuthToStorage (state) {
            localStorage.setItem('auth', JSON.stringify(state))
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
        loadAuthFromStorage(context) {

            let dataFromStorage

            function validExpiration (timestamp) {
                let now = Math.floor(Date.now()/1000)
                timestamp = Math.floor(timestamp)
                if(now >= timestamp){ 
                    console.debug('Token out of date')
                    return false
                }
                else {
                    return true
                }
            }

            try {
                if(!localStorage.hasOwnProperty('auth')){ return false }
                dataFromStorage = JSON.parse(localStorage.getItem('auth'))
                if(dataFromStorage.authorized !== true){ return false}
            }
            catch(e){
                console.debug(e)
                return false
            }            

            if(validExpiration(dataFromStorage.expire)){
                context.commit('sessionUpdate', dataFromStorage)
                router.push('minions')
            }


        },
        logout (context){
            context.commit('sessionClear')
            router.push('login')
        }
    }
}

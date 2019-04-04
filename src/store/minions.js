import axios from 'axios'

export const minions = {
    state: {
        status: {},
        properties: {},
        waiting: false
    },
    getters: {
        minions: state => {
            let arr = []
            for (let key in state.status){
                arr.push(key)
            }
            let nameUp = arr.slice().sort(function(a,b) {
                    if(a < b) return 1;
                    if(a > b) return -1;
                    return 0; 
                })
            let responseUp =  arr.slice().sort(function(a,b) {
                    if(state.status[a] == 'down') return -1;
                    return 1;
                })
            let OSUp = arr.slice().sort(function(a,b) {
                    if(state.properties[a] == null || state.properties[b] == null) return 2 
                    if(state.properties[a].kernel > state.properties[b].kernel) return 1
                    if(state.properties[a].kernel < state.properties[b].kernel) return -1
                    return 0;
                })
            return {
                'nameUp': nameUp,
                'nameDown': nameUp.slice().reverse(),
                'responseUp': responseUp,
                'responseDown': responseUp.slice().reverse(),
                'OSUp': OSUp,
                'OSDown': OSUp.slice().reverse()
            }
        },
    },
    mutations: {
        setMinionStatus(state, statuslist){
            console.debug('Setting statuses....')
            for (let i in statuslist.up){
                let name = statuslist.up[i]
                this._vm.$set(state.status,name,'up')
            }
            for (let i in statuslist.down){
                let name = statuslist.down[i]
                this._vm.$set(state.status,name,'down')
            }
        },
        setMinionGrains(state, grains){
            if(state.properties.hasOwnProperty(grains.name)){    
                console.debug('Setting grains for ' + grains.name)
                this._vm.$set(state.properties,grains.name,grains.properties)
            }
            else {
                this._vm.$set(state.properties,grains.name,grains.properties)
                console.debug('Creating... ' + grains.name)
            }
        },
        waitingOnApi (state) {
            state.waiting = true
        },
        doneWaitingOnApi (state) {
            state.waiting = false
        },
    },
    actions: {
        handleServerErrorResponse (context, response) {

                if(typeof(response['data']['return'][0]) == 'undefined'){
                    throw({name:"EmptyResponse",message:response})
                }

                if(response['data']['return'].includes("Exception occurred")){
                    throw {name:"ServerError",message:response['data']['return'][0]}
                }  

                if(typeof(response['data']['return'][0]) == 'object'){
                    if(Object.keys(response['data']['return'][0]).length == 0){
                        throw {name:"EmptyResponse", message:response}
                    }
                    else{
                        return (response['data']['return'][0])
                    }
                }
        },
        getMinionStatus (context) {
            let auth = context.rootState.auth
            context.commit("waitingOnApi")
            return axios.post('https://' + auth.server + 
                    ':' + auth.port + '/',{
                    client: "runner",
                    fun: "manage.status",
                    },
                    {headers: {
                            'x-auth-token': auth.token,
                            'content-type': 'application/json',
                            'accept': 'application/json'
                        }
                    })
                   .then((response) => {
                        context.commit('doneWaitingOnApi')
                        return context.dispatch('handleServerErrorResponse',response)
                    })
                .catch((err) => {
                    console.debug(err)
                })
        },
        handleMissingMinionGrains (context){
            for (let minionname in context.state.status){
                let minion = context.state.properties[minionname]
                if (minion == null || undefined){
                    context.dispatch('getMinionGrains',minionname)
                    .then((grains) => {
                        context.commit('setMinionGrains', grains)
                    })
                }
                
            }
        },
        getMinionGrains (context, minion) {
            let auth = context.rootState.auth
            return axios.post('https://' + auth.server + 
                    ':' + auth.port + '/',{
                    client: "local",
                    tgt: minion,
                    fun: "grains.items"
                    },
                    {headers: {
                            'x-auth-token': auth.token,
                            'content-type': 'application/json',
                            'accept': 'application/json'
                        }
            }).then((response) => {
                let name = Object.keys(response['data']['return'][0])[0]
                let properties = Object.values(response['data']['return'][0])[0]
                return {'name':name,'properties': properties}
            })
        },
        queueUnknownGrains (context) {
            return new Promise((resolve) => {
                let unknown = context.state.unknown
                for (let i in unknown){
                    context.dispatch('getMinionGrain',unknown[i])
                    .then((response) => {
                        context.dispatch('handleServerErrorResponse',response)
                        .then((response) => {
                            
                            context.commit('updateMinionGrains', {
                                'name': name,
                                'properties': data
                            })
                        })
                    }).then(() => {
                        context.commit('clearUnknown')
                        resolve()
                    })
                }
            })
            
        },
        loadMinions(context) {
            context.dispatch('getMinionStatus')
            .then((statuslist) => { context.commit('setMinionStatus',statuslist)})
            .then(() => { context.dispatch('handleMissingMinionGrains') })
        }
    }
}
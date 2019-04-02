import axios from 'axios'

export const minions = {
    state: {
        all: {},
        unknown: [],
        waiting: false
    },
    getters: {
        minions: state => {
            let arr = []
            for (let key in state.all){
                arr.push({
                    'name':key,
                    'properties':state.all[key].properties,
                    'status': state.all[key].status
                })
            }
            let nameUp = arr.slice().sort(function(a,b) {
                    if(a.name < b.name) return 1;
                    if(a.name > b.name) return -1;
                    return 0; 
                })
            let responseUp =  arr.slice().sort(function(a,b) {
                    if(a.status == 'down') return -1;
                    return 1;
                })
            let OSUp = arr.slice().sort(function(a,b) {
                    if(a.properties == null || b.properties == null) return 2 
                    if(a.properties.kernel > b.properties.kernel) return 1
                    if(a.properties.kernel < b.properties.kernel) return -1
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
                if(state.all.hasOwnProperty(name)){
                    state.all[name].status = 'up'
                }
                else {
                    state.all[name] = {'status': 'up','properties': null}
                }
            }
            for (let i in statuslist.down){
                let name = statuslist.down[i]
                if(state.all.hasOwnProperty(name)){
                    state.all[name].status = 'down'
                }
                else {
                    state.all[name] = {'status': 'down', 'properties': null}
                }
            }
        },
        setMinionGrains(state, grains){
            if(state.all.hasOwnProperty(grains.name) 
            && state.all[grains.name].hasOwnProperty('properties')){    
                console.debug('Setting grains for' + grains.name)
                state.all[grains.name].properties = grains.properties
            }
            else {
                state.all[grains.name] = {'properties': null}
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
            for (let i in context.state.all){
                let minion = context.state.all[i]
                if (minion.properties == null || undefined){
                    context.dispatch('getMinionGrains',i)
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
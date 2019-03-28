import axios from 'axios'

export const minions = {
    state: {
        all: [],
        unknown: [],
        waiting: false
    },
    getters: {
        minions: state => {
            let nameUp = state.all.slice().sort(function(a,b) {
                    if(a.name < b.name) return 1;
                    if(a.name > b.name) return -1;
                    return 0; 
                })
            let responseUp =  state.all.slice().sort(function(a,b) {
                    if(a.status == 'down') return -1;
                    return 1;
                })
            let OSUp = state.all.slice().sort(function(a,b) {
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
        updateMinionStatus (state, minions) {
            var unknown = []
            for (let i in minions.up){
                if(!state.all.includes(minions.up[i])){
                    unknown.push(minions.up[i])
                }
                state.all.push({
                    'name': minions.up[i],
                    'status': 'up',
                    'properties': null
                })
            }
            for (let i in minions.down){
                state.all.push({
                    'name': minions.down[i],
                    'status': 'down',
                    'properties': null
                })
            }
            state.unknown = unknown
        },
        updateMinionsGrains (state, data){
            for (let i in state.all){
                if(data[state.all[i].name]){
                    state.all[i].properties = data[state.all[i].name]
                }
            }
            // TODO: given minion name, update state
            state.unknown.length = 0
        },
        waitingOnApi (state) {
            state.waiting = true
        },
        doneWaitingOnApi (state) {
            state.waiting = false
        }
    },
    actions: {
        handleServerErrorResponse (context, response) {
            if(typeof(response['data']['return'][0]) == 'undefined'){
                    throw {name:"EmptyResponse",message:response}
            }
            if(response['data']['return'].includes("Exception occurred")){
                throw {name:"ServerError",message:response['data']['return'][0]}
            }
            if(typeof(response['data']['return'][0]) == 'object'){
                if(Object.keys(response['data']['return'][0]).length == 0){
                    throw {name:"EmptyResponse", message:response}
                }
                else{
                    return response
                }
            }
            
        },
        getMinionStatus (context) {
            const unknown = context.state.unknown
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
                        context.dispatch('handleServerErrorResponse',response)
                        .then((response) => {
                        let data = response['data']['return'][0]
                        context.commit('updateMinionStatus', data)
                        context.commit('doneWaitingOnApi')
                        context.dispatch('getUnknownGrains')
                        })
                    })
                .catch((err) => {
                    this.onFailure(err)
                })
        },
        getUnknownGrains (context) {
            let auth = context.rootState.auth
            let unknown = context.state.unknown
            return axios.post('https://' + auth.server + 
                ':' + auth.port + '/',{
                client: "local",
                tgt: unknown.join(','),
                tgt_type: "list",
                fun: "grains.items"
                },
                {headers: {
                        'x-auth-token': auth.token,
                        'content-type': 'application/json',
                        'accept': 'application/json'
                    }
                })
                .then((response) => {
                    context.dispatch('handleServerErrorResponse',response)
                    .then((response) => {
                        context.commit('updateMinionsGrains', response['data']['return'][0])
                    })
            })
        },
    }
}
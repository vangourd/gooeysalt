import axios from 'axios'

export const minions = {
    state: {
        all: [],
        unknown: []
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
                    'status': 'up'
                })
            }
            for (let i in minions.down){
                state.all.push({
                    'name': minions.down[i],
                    'status': 'down'
                })
            }
            state.unknown = unknown
        },
        updateMinionGrains (state, data){
            for(let i in state.all){
                if(state.all[i].name == data.name){
                    state.all[i].properties = data.properties
                }
            }
        },
        clearUnknown (state) {
            state.unknown.length = 0
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
                        context.dispatch('getUnknownGrains')
                        })
                    })
                .catch((err) => {
                    this.onFailure(err)
                })
        },
        getUnknownGrains(context){
            let unknown = context.state.unknown
            
            for (let i in unknown){
                console.debug('Running for ' + unknown[i])
                context.dispatch('getMinionGrains',unknown[i])
            }
            context.commit('clearUnknown')
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
                })
                .then((response) => {
                    context.dispatch('handleServerErrorResponse',response)
                    .then((response) => {
                        let data = { 
                            'name': minion, 
                            'properties': response['data']['return'][0][minion]
                        }
                        context.commit('updateMinionGrains', data)
                    })
            })
        },
        refreshInterval (context) {

        },
        dataRefresh (context) {

        }
    }
}
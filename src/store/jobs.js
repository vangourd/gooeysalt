import axios from 'axios'

export const jobs = {
    state: {
        active: {

        },
        completed: {

        }
    },
    mutations: {
        setActiveJobs(state, jobs){
            console.debug('Committing state')
            state.active = {...state.active, ...jobs}
        }
    },
    actions: {
        loadJobs(context){
            context.dispatch('getActiveJobs')
            .then((response) => {
                let jobs = response['data']['return'][0]
                context.commit('setActiveJobs', jobs)
            })
        },
        getActiveJobs(context){
            let auth = context.rootState.auth
            return axios.post('https://' + auth.server + 
            ':' + auth.port + '/',{
            client: "runner",
            fun: "jobs.active",
            },
            {headers: {
                    'x-auth-token': auth.token,
                    'content-type': 'application/json',
                    'accept': 'application/json'
                }
            })
        },
        getCompletedJobsByDate(context, daterange){
            
        }
    }
}
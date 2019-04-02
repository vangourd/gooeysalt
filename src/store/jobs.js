import axios from 'axios'

export const jobs = {
    state: {
        active: {

        },
        completed: {

        },
        dates: {
            '5min': {
                'start': new Date(Date.now() - 300000).toLocaleString(),
                'end': new Date(Date.now()).toLocaleString()
            },
        }
    },
    getters: {
        jobs: state => {
            let active = []
            let completed = []

            for (let key in state.active){
                active.push({
                    'jid':key,
                    'properties':state.active[key],
                })
            }
            for (let key in state.completed){
                completed.push({
                    'jid':key,
                    'properties':state.completed[key],
                })
            }

            let functionUp = completed.slice().sort(
                function(a,b) {
                    if(a.properties.Function < b.properties.Function) return 1;
                    if(a.properties.Function > b.properties.Function) return -1;
                    return 0; 
                })

            let startUp = completed.slice().sort(
                function(a,b) {
                    if(a.properties.StartTime < b.properties.StartTime) return 1;
                    if(a.properties.StartTime > b.properties.StartTime) return -1;
                    return 0; 
                })

            let targetUp = completed.slice().sort(
                function(a,b) {
                    if(a.properties.Target < b.properties.Target) return 1;
                    if(a.properties.Target > b.properties.Target) return -1;
                    return 0; 
                })

            return {
                'active': active,
                'completed': {
                    'functionUp': functionUp,
                    'functionDown': functionUp.slice().reverse(),
                    'startUp': startUp,
                    'startDown': startUp.slice().reverse(),
                    'resultUp': [],
                    'resultDown': [],
                    'targetUp': targetUp,
                    'targetDown': targetUp.slice().reverse(),
                }
            }
        }
    },  
    mutations: {
        setActiveJobs(state, jobs){
            console.debug('Committing state')
            state.active = {...state.active, ...jobs}
        },
        setCompletedJobs(state, jobs){
            console.debug('Committing completed job merge')
            state.completed = {...state.completed, ...jobs}
        }
    },
    actions: {
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
            }).then((response) => {
                context.commit('setActiveJobs', response['data']['return'][0])
            })
        },
        getCompletedJobsByDate(context, datetime){
            let auth = context.rootState.auth
            return axios.post('https://' + auth.server + 
                    ':' + auth.port + '/',{
                    client: "runner",
                    fun: "jobs.list_jobs",
                    start_time: datetime.start,
                    end_time: datetime.end,
                    },
                    {headers: {
                            'x-auth-token': auth.token,
                            'content-type': 'application/json',
                            'accept': 'application/json'
                        }
            }).then((response) => {
                context.commit('setCompletedJobs',response['data']['return'][0])
            })
        },
        getJobsIn5Minutes(context) {
            context.dispatch('getCompletedJobsByDate', context.state.dates['5min'])
        }
    }
}
import axios from 'axios'
import {SaltClient, QueryHandler} from './SaltClient.js'

export default class SaltJobs extends SaltClient {
    constructor(setup){
        super(setup)
        this.sort = {
                functionUp: function(jobs){
                    jobs.sort(function(a,b) {
                        if(a.properties.Function < b.properties.Function) return 1;
                        if(a.properties.Function > b.properties.Function) return -1;
                        return 0; 
                    })
                    return jobs
                },

                functionDown: function(jobs){
                    jobs.sort(function(a,b) {
                        if(a.properties.Function > b.properties.Function) return 1;
                        if(a.properties.Function < b.properties.Function) return -1;
                        return 0; 
                    })
                    return jobs
                },
                // TODO: This needs to use date objects and not just strings as JS's string comparison is broken
                startUp: function(jobs){
                    jobs.sort(function(a,b) {
                        if(new Date(a.properties.StartTime) < new Date(b.properties.StartTime)) return 1;
                        if(new Date(a.properties.StartTime) > new Date(b.properties.StartTime)) return -1;
                        return 0; 
                    })
                    return jobs
                },

                startDown: function(jobs){
                    jobs.sort(function(a,b) {
                        if(new Date(a.properties.StartTime) > new Date(b.properties.StartTime)) return 1;
                        if(new Date(a.properties.StartTime) < new Date(b.properties.StartTime)) return -1;
                        return 0; 
                    })
                    return jobs
                },

                targetUp: function(jobs){
                    jobs.sort(function(a,b) {
                        if(a.properties.Target < b.properties.Target) return 1;
                        if(a.properties.Target > b.properties.Target) return -1;
                        return 0; 
                    })
                    return jobs
                },

                targetDown: function(jobs){
                    jobs.sort(function(a,b) {
                        if(a.properties.Target > b.properties.Target) return 1;
                        if(a.properties.Target < b.properties.Target) return -1;
                        return 0; 
                    })
                    return jobs
                }
        }
        // TODO: Migrate Search functionality into library
        this.jobs = {
            active: new ActiveJobsHandler(setup.auth,setup.active),
            complete: new CompleteJobsHandler(setup.auth,setup.complete,setup.timeScale),
        }
    }
}
class ActiveJobsHandler extends QueryHandler {
    constructor(auth,data) {
        super(auth,data)
        this.startPoller('init',this.get(),30000)
        this.onSuccess = (jobs) => {
            this.waitingOnResponse = false
            this.data.length = 0
            this.data.push.apply(data, jobs)
        }
        this.onFailure = (err) => {
                console.debug(err)
                this.waitingOnResponse = false
        }
    }
    get() {
            this.waitingOnResponse = true
            this.active_jobs_array(
                this.onSuccess,
                this.onFailure
            )
    }
    active_jobs_array () {
        axios.post('https://' + this.auth.server + 
            ':' + this.auth.port + '/',{
            client: "runner",
            fun: "jobs.active",
            },
            {headers: {
                    'x-auth-token': this.auth.token,
                    'content-type': 'application/json',
                    'accept': 'application/json'
                }
            })
        .then( (response) => {
            this.handleServerErrorResponse(response)
            var jobsArray = this.jobsToArray(response)
            this.onSuccess(jobsArray)
        })
        .catch((err) => {
            this.onFailure(err)
        })
    }
    jobsToArray (response){
                var query = response['data']['return'][0]
                var jobsArray = []
                for (var jid in query){
                    jobsArray.push({'jid':jid,'properties': query[jid]})
                }
                return jobsArray
    }   
    
}

class CompleteJobsHandler extends QueryHandler {

    constructor(auth,data,scale) {
        super(auth,data)
        this.scale = scale
        this.data = data
        this.auth = auth
        this.onSuccess = (jobs) => {
            this.waitingOnResponse = false
            this.data.length = 0
            this.data.push.apply(data, jobs)
        }
        this.onFailure = (err) => {
                console.debug(err)
                this.waitingOnResponse = false
        }
    }

    list_jobs (start_time,end_time) {
                axios.post('https://' + this.auth.server + 
                    ':' + this.auth.port + '/',{
                    client: "runner",
                    fun: "jobs.list_jobs",
                    start_time: start_time,
                    end_time: end_time,
                    },
                    {headers: {
                            'x-auth-token': this.auth.token,
                            'content-type': 'application/json',
                            'accept': 'application/json'
                        }
                    })
                   .then( (response) => {
                    this.handleServerErrorResponse(response)
                    var jobsArray = this.jobsToArray(response)
                    this.onSuccess(jobsArray)
                })
                .catch((err) => {
                    this.onFailure(err)
                })
    }

    removeDuplicateJobs (jobs){
                for(var index in jobs){
                    if(!lookupTable.includes(newJobs[index].jid)){
                        lookupTable.push(newJobs[index].jid)
                    }
                }
                return lookupTable
    }

    getRecent() {
        var start_time = new Date(Date.now() - 300000)
        var end_time = new Date(Date.now())
        var start_time = start_time.toLocaleString()
        var end_time = end_time.toLocaleString()
        this.list_jobs(
            start_time,
            end_time,
            this.onSuccess,
            this.onFailure
        )
    }

    getByDate(){
        this.waitingOnResponse = true
        this.list_jobs(
            this.scale.from.toLocaleString(),
            this.scale.to.toLocaleString(), 
            )
    }

    search(queries){
        var filtered = []
        for(var query in queries){
            if(!queries[query]){continue}
            for(var jid in this.data){
                if(this.data[jid].properties[queries[query].propname].includes(queries[query].value)){
                    filtered.push(this.data[jid])
                }
            }
        }
        if(filtered.length > 0){
            this.data.length = 0
            this.data.push.apply(this.data,filtered)
        }
    }
    jobsToArray (response){
                var query = response['data']['return'][0]
                var jobsArray = []
                for (var jid in query){
                    jobsArray.push({'jid':jid,'properties': query[jid]})
                }
                return jobsArray
    }   
}
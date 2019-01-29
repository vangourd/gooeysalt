import axios from 'axios'
import SaltClient from './SaltClient.js'

export default class SaltJobs extends SaltClient {
    constructor(auth,complete,active){
        super(auth)
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

                startUp: function(jobs){
                    jobs.sort(function(a,b) {
                        if(a.properties.StartTime < b.properties.StartTime) return 1;
                        if(a.properties.StartTime > b.properties.StartTime) return -1;
                        return 0; 
                    })
                    return jobs
                },

                startDown: function(jobs){
                    jobs.sort(function(a,b) {
                        if(a.properties.StartTime > b.properties.StartTime) return 1;
                        if(a.properties.StartTime < b.properties.StartTime) return -1;
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
        this.jobs = {
            active: new ActiveJobsHandler(auth,active),
            complete: new CompleteJobsHandler(auth,complete),
        }
    }
}
class QueryHandler {
        constructor(auth,data){
            this.waitingOnResponse = false
            this.intervals = {}
            this.auth = auth
            this.data = data
            this.onSuccess = (jobs) => {
                console.debug('Jobs before')
                this.waitingOnResponse = false
                this.data.push.apply(data, jobs)
            }
            this.onFailure = (err) => {
                    console.debug(err)
                    this.waitingOnResponse = false
            }
        }
        startPoller(name,query,freqInMS) {
            this.intervals[name] = setInterval(query,freqInMS)
        }
        stopPoller(name) {
            clearInterval(this.intervals[name])
        }
        jobsToArray (response){
                var query = response['data']['return'][0]
                var jobsArray = []
                for (var jid in query){
                    jobsArray.push({'jid':jid,'properties': query[jid]})
                }
                return jobsArray
        }           
        handleServerErrorResponse(response) {
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
                }
                else{
                    return true
                }
        }
}

class ActiveJobsHandler extends QueryHandler {
    constructor(auth,data) {
        super(auth,data)
    }
    get() {
            console.debug(this)
            this.waitingOnResponse = true
            this.active_jobs_array(
                this.onSuccess,
                this.onFailure
            )
    }
    active_jobs_array (onSuccess, onFailure) {
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
            console.debug(this)
            var jobsArray = this.jobsToArray(response)
            this.handleServerErrorResponse(response)
            this.onSuccess(jobsArray)
        })
        .catch((err) => {
            console.debug(err)
            this.onFailure()
        })
    }
    
}

class CompleteJobsHandler extends QueryHandler {

    constructor(auth,data) {
        super(auth,data)
        this.index = []
        console.debug('At the constructor level')
        console.debug(this)
    }

    list_jobs (start_time,end_time,onSuccess) {
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
                    console.debug(this)
                    this.handleServerErrorResponse(response)
                    var jobsArray = this.jobsToArray(response)
                    this.onSuccess(jobsArray)
                })
                .catch((err) => {
                    console.debug(err)
                })
    }

    

    joinJobData (lookupTable,newJobs){
                if(typeof(lookupTable) === 'undefined'){throw "Missing [0:Array of jid's] parameter"}
                if(typeof(newJobs) === 'undefined'){throw "Missing [1: New data to merge'] parameter"}
                for(var index in newJobs){
                    if(!lookupTable.includes(newJobs[index].jid)){
                        lookupTable.push(newJobs[index].jid)
                    }
                }
                return lookupTable
    }

    getTwentyFourHours(onSuccess) {
        var start_time = new Date(Date.now() - (24 /*Hours*/ (60 * (60 * 1000))))
        var end_time = new Date(Date.now())
        var start_time = start_time.toLocaleString()
        var end_time = end_time.toLocaleString()

        this.list_jobs(
            start_time,
            end_time,
            onSuccess,
            this.completedJobs.onFailure
        )
    }

    getRecent(onSuccess) {
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

    getByDate(onSuccess, onFailure, start,end){
        var start_time = start
        var end_time = end
        this.list_jobs(start_time, end_time, onSuccess, onFailure)
    }
    jidInventory(jobs) {
            if(this.jobs.length <= 0){ return }
            var jids = []
            jobs.forEach( function(job, index) {
                jids.push(job.jid)
            })
            return jids
    }
}
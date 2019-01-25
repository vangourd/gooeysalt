import axios from 'axios'
import SaltClient from './SaltClient.js'

export default class SaltJobs extends SaltClient {
    constructor(auth){
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

            list_jobs: (response) => {
                console.debug('list_jobs was run')
            },
            list_jobs_array: (response) => {
                var query = response['data']['return'][0]
                var jobsArray = []
                for (var jid in query){
                    jobsArray.push({'jid':jid,'properties': query[jid]})
                }
                return jobsArray
            },
            active_jobs_array: (onSuccess, onFailure) => {
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
                .then((response) => {
                    this.handleServerErrorResponse(response)
                    var query = response['data']['return'][0]
                    var jobsArray = []
                    for (var jid in query){
                        jobsArray.push({'jid':jid,'properties': query[jid]})
                    }
                    onSuccess(jobsArray)
                })
                .catch((err) => {
                    console.debug(err)
                    onFailure()
                })
            },

            getJobsInLastFiveMinutes: (onSuccess,onFailure) => {
                var start_time = new Date(Date.now() - 300000)
                var end_time = new Date(Date.now())
                var start_time = start_time.toLocaleString()
                var end_time = end_time.toLocaleString()
                this.jobs.list_jobs(start_time,end_time,onSuccess,onFailure)
            },
            getJobsInLastFourHours: (onSuccess,onFailure) => {
                var start_time = new Date(Date.now() - 14400000)
                var end_time = new Date(Date.now())
                var start_time = start_time.toLocaleString()
                var end_time = end_time.toLocaleString()
                this.jobs.list_jobs(start_time,end_time,onSuccess,onFailure)
            },
            getActiveJobs: (onSuccess, onFailure) => {
                this.jobs.active_jobs_array(onSuccess,onFailure)
            },

        }
        this.activeJobs = {
            waitingOnResponse: false,
            interval: null,
            data: [],
            setupInterval: () => {
                this.interval = setInterval(
                    function() {
                        this.get(this.onSuccess)
                    },
                    /*every*/ 60000 /*milliseconds*/
                )
            },
            clearInterval: () => {
                clearInterval(this.interval)
            },
            onSuccess: function(response){
                console.debug(response)
                this.waitingOnResponse = false
            },
            onFailure: (err) => {
                    console.debug(err)
                    this.waitingOnResponse = false
            },
            get: (onSuccess) => {
                var onSuccessRetandRelease = (response) =>{
                    onSuccess(response)
                    this.activeJobs.waitingOnResponse = false
                }
                this.activeJobs.waitingOnResponse = true
                this.jobs.active_jobs_array(onSuccessRetandRelease,this.activeJobs.onFailure)
            }
        }
        this.completedJobs = {
            waitingOnResponse: false,
            interval: setInterval(function() {
                    this.completedJobs.getRecent(this.completedJobs.onSuccess)
                },60000),
            index: [],
            data: [],
            clearInterval: () => {
                clearInterval(this.interval)
            },
            onFailure: (err) => {
                console.debug(err)
                this.waitingOnResponse = false
            },
            onSuccess: function(response){
                console.debug(response)
                this.waitingOnResponse = false
            },
            getTwentyFourHours: (onSuccess) => {
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
            },
            getRecent: (onSuccess) =>{
                var start_time = new Date(Date.now() - 300000)
                var end_time = new Date(Date.now())
                var start_time = start_time.toLocaleString()
                var end_time = end_time.toLocaleString()
                this.list_jobs(
                    start_time,
                    end_time,
                    onSuccess,
                    this.completedJobs.onFailure
                )
            },
            getByDate: (onSuccess, onFailure, start,end) => {
                var start_time = start
                var end_time = end
                this.list_jobs(start_time, end_time, onSuccess, onFailure)
            }


        }
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
                .then((response) => {
                    this.handleServerErrorResponse(response)
                    var jobsArray = this.jobsToArray(response)
                    onSuccess(jobsArray)
                })
                .catch((err) => {
                    console.debug(err)
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
import axios from "axios";

export default class SaltClient {

    constructor(auth) {
        if(auth == undefined){throw {name:"AuthError",message:"Authentication error creating salt client."}}
        this.auth = auth
        this.jobs = {

            list_jobs: (start_time,end_time,onSuccess,onFailure) => {
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
                    onSuccess(response)
                })
                .catch((err) => {
                    console.debug(err)
                    onFailure()
                })
            },
            active: (onSuccess, onFailure) => {
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
                    onSuccess(response)
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
                this.jobs.active(onSuccess,onFailure)
            },
            sort: {
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
        }
    }

    createBaseURL(server, port) {
        return ('https://' + server + ':' + port)
    }

    setupAxios() {
        this.axios = axios.create({
                baseURL: this.baseurl,
                headers: {
                    'x-auth-token': this.auth.token,
                    'content-type': 'application/json',
                    'accept': 'application/json'
                },
                timeout: 1000 * 5 
    
        })
    }

    testConnection() {
        // TODO: Do a post and test that authentication passes. If fail logout
        this.axios.get('/')
        .then((response) => {
            if(response.status == 200){
                console.debug("Axios Test Worked")
            }
            else {
                console.debug("Axios Test Failed")
            }
        })
        .catch((e) => {
            console.debug(e)
        })
    }

    handleServerErrorResponse(response) {
                if(typeof(response['data']['return'][0]) == 'undefined'){
                    throw {name:"EmptyResponse",message:response}
                }
                if(response['data']['return'].includes("Exception occurred")){
                        throw {name:"ServerError",message:response['data']['return'][0]}
                }
                else{
                    return true
                }
    }
}
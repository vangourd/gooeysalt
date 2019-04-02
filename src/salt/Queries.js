import axios from 'axios'

class QueryHandler {
        constructor(auth){
            this.waitingOnResponse = false
            this.intervals = {}
            this.auth = auth
            this.data = null
        }
        startPoller(name,query,freqInMS) {
            this.intervals[name] = setInterval(query,freqInMS)
        }
        stopPoller(name) {
            clearInterval(this.intervals[name])
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
    constructor(auth) {
        super(auth)
        //this.startPoller('init',this.get(),30000)
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
    // active_jobs_array () {
    //     axios.post('https://' + this.auth.server + 
    //         ':' + this.auth.port + '/',{
    //         client: "runner",
    //         fun: "jobs.active",
    //         },
    //         {headers: {
    //                 'x-auth-token': this.auth.getToken(),
    //                 'content-type': 'application/json',
    //                 'accept': 'application/json'
    //             }
    //         })
    //     .then( (response) => {
    //         this.handleServerErrorResponse(response)
    //         var jobsArray = this.jobsToArray(response)
    //         this.onSuccess(jobsArray)
    //     })
    //     .catch((err) => {
    //         this.onFailure(err)
    //     })
    // }
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

    constructor(auth,scale) {
        super(auth)
        this.scale = scale
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
                            'x-auth-token': this.auth.getToken(),
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

class MinionsHandler extends QueryHandler {
    constructor(auth){
        super(auth)
        this.data = []
        this.index = []
        this.auth = auth

        this.onSuccess = (minions) => {
            this.waitingOnResponse = false
            this.data.length = 0
            this.data.push.apply(this.data, minions)
        }
        this.onFailure = (err) => {
            console.debug(err)
            this.waitingOnResponse = false
        }
        this.sort = { 
        }

    }
    clearAndGet() {
        this.data.length = 0
        this.get()
    }
    get() {
        let statusPromise = this.minions_status()
        statusPromise.then((status_response) => {
            let unknown = this.updateMinionStatusReturnUnknown(status_response)
            if (unknown.length > 0){
                this.getUnknownGrains(unknown)
            }
        })
    }
    minions_status() {
        let statuses = axios.post('https://' + this.auth.server + 
                    ':' + this.auth.port + '/',{
                    client: "runner",
                    fun: "manage.status",
                    },
                    {headers: {
                            'x-auth-token': this.auth.getToken(),
                            'content-type': 'application/json',
                            'accept': 'application/json'
                        }
                    })
                   .then((response) => {
                    this.handleServerErrorResponse(response)
                    var parsed = this.parseStatus(response)
                    return parsed
                })
                .catch((err) => {
                    this.onFailure(err)
                })
        return statuses
    }
    updateMinionStatusReturnUnknown(statuses) {
        var unknown = []

        for (var a in statuses.up){
            let minion_name = statuses.up[a]
            let position = this.index.indexOf(minion_name)
            if(position === -1){ // -1 if it's not found
                unknown.push(minion_name)
            }
            else {
                this.data[position].status = 'up'
            }
        }
        for (var i in statuses.down){
            let minion_name = statuses.down[i]
            let position = this.index.indexOf(minion_name)
            if (position !== -1){ // if it's found (not not)
                this.data[position].status = 'down'
            }
        }
        return unknown
    }
    getUnknownGrains(unknown){
        console.debug("We're inside get UnknownGrains Loop")
        for (var un in unknown){
            let current = unknown[un]
            var grains_promise = this.grains_get(current)
            grains_promise.then((response) => {
                let properties = response[current]
                console.debug(response)
                console.debug(current)
                this.data.push({'name':current,'properties':response[current],'status':'up'})
            })
        }
    }
    parseStatus(response) {
        return response['data']['return'][0]
    }
    grains_get(minion) {
        var grains_promise = axios.post('https://' + this.auth.server + 
                    ':' + this.auth.port + '/',{
                    client: "local",
                    tgt: minion,
                    fun: "grains.items"
                    },
                    {headers: {
                            'x-auth-token': this.auth.getToken(),
                            'content-type': 'application/json',
                            'accept': 'application/json'
                        }
                    })
                   .then((response) => {
                    this.handleServerErrorResponse(response)
                    var parsed = this.parseStatus(response)
                    return parsed
                })
                .catch((err) => {
                    this.onFailure(err)
                })
        return grains_promise
    }
    getMetaData(minion) {
        this.grains_get(minion)
    }
    setMetaData(minion,data){
        if (this.data.includes(minion)){
            this.data[minion].properties = data
        }
        else {
            this.data.push({"name":minion,"properties":data[minion],"status":"up"})
        }
    }
}

class StatesHandler extends QueryHandler{
    constructor(auth){
        super(auth)
    }
}


export {ActiveJobsHandler, CompleteJobsHandler, MinionsHandler, StatesHandler}
import axios from "axios";

class SaltClient {

    constructor(setup) {
        if(setup.auth == undefined){throw {name:"AuthError",message:"Authentication error creating salt client."}}
        this.auth = setup.auth
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
}
class QueryHandler {
        constructor(auth,data){
            this.waitingOnResponse = false
            this.intervals = {}
            this.auth = auth
            this.data = data
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

export { SaltClient, QueryHandler }
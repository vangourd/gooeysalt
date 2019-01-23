import axios from "axios";

export default class SaltClient {

    constructor(auth) {
        if(auth == undefined){throw {name:"AuthError",message:"Authentication error creating salt client."}}
        this.auth = auth
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
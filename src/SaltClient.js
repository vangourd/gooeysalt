import axios from "axios";

export default class SaltClient {

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
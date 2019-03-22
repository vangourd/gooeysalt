import axios from 'axios'

export default class Auth {

    constructor() {

        // private variables
        var connected = false
        var token = ""
        var expire = ""
        var perms = ""

        // public variables
        this.server = "localhost"
        this.port = "8000"
        this.eauth = "auto"
        this.waiting = false
        this.status = false

        this.login = function(password,callback) {

            var success = (response) => {
                let data = this.parseAuthData(response)
                connected = true
                this.status = true
                token = data['token']
                perms = data['perms']
                expire = data['expire']
                this.waiting = false
                callback()
            }

            var failure = (error) => {
                this.waiting = false
                console.debug(error)
            }

            if (this.waiting !== true){
                this.waiting = true
                this.sendLoginPost(password,success,failure)
            }
        }

        this.logout = function(){
            this.sendLogoutPost()
            this.clearInfo()
        }

        this.serverPing = function(server,port,success,failure) {
            axios.get('https://' + server + 
                            ':' + port + '/')
                .then((response) => {
                    success(response)
                })
                .catch((error) => {
                    console.debug(error)
                    failure(error)
                })          
        }
        
        this.saveAuthToStorage = function(){

        }
        this.loadAuthFromStorage = function(){
            
        }

        this.clearInfo = function() {
            localStorage.clear()
        }

        this.tokenNotExpired = function() {
            return true
        }

        this.getToken = function() {
            return token
        }

        this.hasValidConnection = function() {
           if(token && this.tokenNotExpired(token)){
               return true
           } 
        }
        this.export = function () {
            return {
                'connected': connected,
                'token': this.getToken(),
                'expire': expire,
                'perms': perms,
                'server': this.server,
                'port': this.port,
                'eauth': this.eauth,
                'waiting': this.waiting,
                'status': this.status
            }
        }
        this.import = function(info) {
            if(info.expire < (new Date).getTime()){
                connected = info.connected,
                token = info.token,
                expire = info.expire,
                perms = info.perms,
                this.server = info.server,
                this.port = info.port,
                this.eauth = info.eauth,
                this.waiting = info.waiting,
                this.status = info.status
            }
        }
    }
    sendLoginPost (password,success,failure){
            axios.post('https://' + this.server + 
                            ':' + this.port + '/login', {
                    username: this.username,
                    password: password,
                    eauth: this.eauth
                })
                .then(success).catch(failure);
    }
    sendLogoutPost(){
                axios.post('https://' + this.server + 
                                ':' + this.port + '/logout', {},{
                    headers: {
                        'x-auth-token': this.token,
                        'content-type': 'application/json',
                        'accept': 'application/json'
                    }
            });
    }
    parseAuthData(response){
        return response['data']['return'][0]
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
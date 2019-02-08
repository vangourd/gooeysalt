import axios from 'axios'
import { QueryHandler } from './SaltClient.js'

export default class SaltMinions extends QueryHandler {
    constructor(setup){
        super(setup.auth)
        this.data = []
        this.auth = setup.auth

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
            nameUp: function(minions) {
                minions.sort(function(a,b) {
                    if(a.name < b.name) return 1;
                    if(a.name > b.name) return -1;
                    return 0; 
                })
                return minions
            },
            nameDown: function(minions){
                minions.sort(function(a,b) {
                    if(a.name < b.name) return -1;
                    if(a.name > b.name) return 1;
                    return 0; 
                })
                return minions
            },
            responseUp: function(minions){
                minions.sort(function(a,b) {
                    if(a.properties == null) return -1;
                    return 1;
                })
                return minions
            },
            responseDown: function(minions){
                minions.sort(function(a,b) {
                    if(a.properties == null) return 1;
                    return -1;
                })
                return minions
            },
            osUp: function(minions){
                minions.sort(function(a,b) {
                    if(a.properties == null || b.properties == null) return 2 
                    if(a.properties.kernel > b.properties.kernel) return 1
                    if(a.properties.kernel < b.properties.kernel) return -1
                    return 0;
                })
                return minions
            },
            osDown: function(minions){
                minions.sort(function(a,b) {
                    if(a.properties == null || b.properties == null) return 2
                    if(a.properties.kernel > b.properties.kernel) return -1
                    if(a.properties.kernel < b.properties.kernel) return 1
                    return 0;
                })
                return minions
            }
        }

    }
    minions_status() {
        axios.post('https://' + this.auth.server + 
                    ':' + this.auth.port + '/',{
                    client: "runner",
                    fun: "manage.status",
                    },
                    {headers: {
                            'x-auth-token': this.auth.token,
                            'content-type': 'application/json',
                            'accept': 'application/json'
                        }
                    })
                   .then((response) => {
                    this.handleServerErrorResponse(response)
                    var parsed = this.parseStatus(response)
                    // for minion in response
                    for (var minion in parsed.up){
                        if (this.minionIsKnown(minion)){
                            this.data[minion].status = "up"
                        }
                        else {
                            this.getMetaData(parsed.up[minion])
                        }
                    }
                    for (var minion in parsed.down){
                        if (this.minionIsKnown(minion)){
                            this.data[minion].status = "down"
                        }
                    }
                        // if minionIsKnown
                            // updateMinionStatus
                        // else
                            // updateMinionGrains
                        
                })
                .catch((err) => {
                    this.onFailure(err)
                })
    }
    minionIsKnown(minion){
        if(this.data.includes(minion)){
            return true
        }
        return false
    }
    parseStatus(response) {
        console.debug(response)
        return response['data']['return'][0]
    }
    grains_get(minion) {
       axios.post('https://' + this.auth.server + 
                    ':' + this.auth.port + '/',{
                    client: "local",
                    tgt: minion,
                    fun: "grains.items"
                    },
                    {headers: {
                            'x-auth-token': this.auth.token,
                            'content-type': 'application/json',
                            'accept': 'application/json'
                        }
                    })
                   .then((response) => {
                    console.debug(response)
                    this.handleServerErrorResponse(response)
                    var parsed = this.parseStatus(response)
                    this.setMetaData(minion,parsed)
                })
                .catch((err) => {
                    this.onFailure(err)
                })
    }
    get() {
        this.minions_status()
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
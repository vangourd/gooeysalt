import axios from 'axios'
import { SaltClient, QueryHandler } from './SaltClient.js'

export default class SaltMinions extends SaltClient {
    constructor(setup){
        super(setup)
        this.data = setup.data
        this.minions = new MinionQueryHandler(setup)
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
}
class MinionQueryHandler extends QueryHandler {
    constructor(setup){
        super(setup.auth,setup.data)
        this.data = setup.data
        this.auth = setup.auth
        this.onSuccess = (minions) => {
            console.debug(this)
            this.waitingOnResponse = false
            this.data.length = 0
            this.data.push.apply(this.data, minions)
        }
        this.onFailure = (err) => {
            console.debug(err)
            this.waitingOnResponse = false
        }
    }
    minions_status() {
        axios.post('https://' + this.auth.server + 
                    ':' + this.auth.port + '/',{
                    client: "runner",
                    fun: "manage.up",
                    },
                    {headers: {
                            'x-auth-token': this.auth.token,
                            'content-type': 'application/json',
                            'accept': 'application/json'
                        }
                    })
                   .then((response) => {
                    this.handleServerErrorResponse(response)
                    var minions = this.intoArray(response)
                    this.onSuccess(minions)
                })
                .catch((err) => {
                    this.onFailure(err)
                })
    }
    minions_list() {
      
    }
    get() {
        this.minions_status()
    }
    intoArray(response) {
        var query = response['data']['return'][0]
        var minionArray = []
        for (var i in query){
            minionArray.push({'jid':i,'properties': query[i]})
        }
        return minionArray
    }
}
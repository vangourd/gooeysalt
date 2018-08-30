<template>
<b-col>
    <b-navbar toggleable="md" type="dark" variant="dark">
        <b-navbar-toggle target="minions_collapse"></b-navbar-toggle>
        <b-navbar-brand class="fa fa-cubes"> Minions</b-navbar-brand>
        <b-collapse is-nav id="minions_collapse">
        <b-navbar-nav>
            <b-nav-text> Sort by:</b-nav-text>
            <b-nav-item><i class="fa fa-sort-alpha-up"></i> Name</b-nav-item>
            <b-nav-item><i class="fa fa-heartbeat"></i> Response</b-nav-item>
            <b-nav-item><i class="fa fa-check"></i> State</b-nav-item>
            <b-nav-item><i class="fab fa-windows"></i> OS</b-nav-item>
            <b-nav-text> Actions:</b-nav-text>
            <b-nav-item right><i class="fa fa-plus"> New Minion</i></b-nav-item>
            <b-nav-item @click="loadMinions" right><i class="fa fa-sync-alt"> Refresh</i></b-nav-item>
        </b-navbar-nav>
        </b-collapse>
    </b-navbar>
    <div v-if="minions" v-for="(value, key) in minions" :key="value.id">
        <b-card v-if="value">
            <!-- Name and OS Type -->
            <span>
                <i class="fab" :class="{ 'fa-windows large' : (value.return.kernel == 'Windows') }"></i>
                <i class="fab" :class="{ 'fa-linux large' : (value.return.kernel == 'Linux') }"></i>
                <strong>{{value.return.host}}</strong>
            </span><br>
            <!-- Properties -->
            <span>
                <b-badge v-for="(role, index) in value.return.roles" :key="index">{{ role }}</b-badge>
            </span>
        </b-card>
        <b-card class="minioncard text-muted" v-if="!value">
            <i class="fa fa-bed"></i>
            <strong>{{ key }}</strong>
        </b-card>
    </div>
    <spinner v-if="minions.length == 0"></spinner>
</b-col>

</template>

<script>
import axios from 'axios'
import Spinner from './Spinner.vue'

export default {
    name: 'minionlist',
    components: {
        'spinner': Spinner
    },
    methods: {
        loadMinions: function() {
                // Look for job type in last hour
                if(this.state.auth.status == true){
                // API Call
                axios.post('https://' + this.state.auth.server + 
                    ':' + this.state.auth.port + '/', {
                        client: "runner",
                        fun: "jobs.last_run",
                        function: "grains.items"
                        //"target-type": "list",
                    },{
                        headers: {
                            'x-auth-token': this.state.auth.token,
                            'content-type': 'application/json',
                            'accept': 'application/json'
                        }
                    })
                    .then((response) => {
                        // Once API call received
                        // TODO: Figure out a way to catch Salt Errors when no jobs are found
                        try {
                            var query = response['data']['return'][0]
                            query = query[Object.keys(query)[0]]
                            //this.minions = response
                            let now = new Date()
                            let then = new Date(query.StartTime)
                            // Get the difference of the two times
                            let difference = now - then
                            // Convert milliseconds to seconds
                            difference = difference / 1000
                            // Convert seconds to minutes
                            difference = difference / 60
                            // Convert minutes to hours
                            difference = difference / 60
                            if(difference < 8){
                                this.minions = []
                                for (var key in query.Result) {
                                    query.Result[key].name = key
                                    this.minions.push(query.Result[key])
                                }
                                console.debug('loading minion data from recent job')
                                console.debug(difference)
                            }
                        }
                        catch(err) {
                            console.error(err)
                        }
                        
                    } )
                    .catch((error) => {
                        console.error(error)
                    })
                }
                

                // if(this.state.auth.status == true){ 
                // axios.post('https://' + this.state.auth.server + 
                //     ':' + this.state.auth.port + '/', {
                //         client: "local",
                //         tgt: "*",
                //         fun: "grains.items"
                //     },{
                //     headers: {
                //         'x-auth-token': this.state.auth.token,
                //         'content-type': 'application/json',
                //         'accept': 'application/json'
                //     }
                //           })
                //      .then((response) => {
                //          console.debug("Processing minions response")
                //          if(response) {
                //             this.minions = response['data']['return'][0]
                //             localStorage.setItem('minions', JSON.stringify(response['data']['return'][0]))
                //          }
                //          } )
                //      .catch((error) => {
                //         console.error(error)
                //     })
                // }
            },
        startGrainsItems: function() {
            console.debug('launching startGrainsItems')
             if(this.state.auth.status == true){ 
                axios.post('https://' + this.state.auth.server + 
                    ':' + this.state.auth.port + '/', {
                        client: "local",
                        tgt: "*",
                        fun: "grains.items"
                    },{
                    headers: {
                        'x-auth-token': this.state.auth.token,
                        'content-type': 'application/json',
                        'accept': 'application/json'
                    }
                          })
                     .then((response) => {
                         if (response.status == 200) {
                            return true
                         }
                            return false
                         } )
                     .catch((error) => {
                        console.error(error)
                    })
                }
        },
        initView: function() {
            console.debug('initView started')
            if(localStorage.getItem('minions')){
                console.debug('loading local storage')
                this.minions = JSON.parse(localStorage.getItem('minions'))
            }
        }
    },
    data() {
        return {
           state: this.$root.sharedState.state,
           minions: [],
           jid: null,
        }
    },
    created() {
        this.initView()
        this.loadMinions()
        this.timer = setInterval(this.loadMinions, 600000)
    }
}
</script>

<style>

</style>

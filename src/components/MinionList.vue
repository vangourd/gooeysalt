<template>
<b-col>
    <b-navbar toggleable="md" type="dark" variant="dark">
        <b-navbar-toggle target="minions_collapse"></b-navbar-toggle>
        <b-navbar-brand class="fa fa-cubes"> Minions</b-navbar-brand>
        <b-collapse is-nav id="minions_collapse">
        <b-navbar-nav>
            <b-nav-text> Sort by:</b-nav-text>
            <b-nav-item @click="toggleSort('alpha')">
                <i class="fa" :class="{
                    'fa-sort-up': this.sort == 'alphaSortUp',
                    'fa-sort-down': this.sort == 'alphaSortDown',
                    'fa-server': !this.sort.includes('alpha')
                }"> Name</i>
            </b-nav-item>
            <b-nav-item @click="toggleSort('response')">
                <i class="fa" :class="{
                    'fa-sort-up':this.sort == 'responseSortUp',
                    'fa-sort-down':this.sort == 'responseSortDown',
                    'fa-heartbeat': !this.sort.includes('response')
                }"> Response</i>
            </b-nav-item>
            <b-nav-item><i class="fa fa-check"></i> State</b-nav-item>
            <b-nav-item @click="toggleSort('os')">
                <i :class="{
                    'fa fa-sort-up':this.sort == 'osSortUp',
                    'fa fa-sort-down':this.sort == 'osSortDown',
                    'fab fa-windows': !this.sort.includes('os')
                }"> OS</i>
            </b-nav-item>
            <b-nav-item-dropdown right text="Actions">
                <b-dropdown-item right><i class="fa fa-plus"> New Minion</i></b-dropdown-item>
                <b-dropdown-item @click="refreshGrains" right>
                    <i class="fa fa-sync-alt"> Refresh</i>
                </b-dropdown-item>
            </b-nav-item-dropdown>
        </b-navbar-nav>
        </b-collapse>
    </b-navbar>
    <div v-if="minions" v-for="minion in minionSorted" :key="minion.name">
        <b-card v-if="minion.properties">
            <!-- Name and OS Type -->
            <span>
                <i class="fab" :class="{ 'fa-windows large' : (minion.properties.kernel == 'Windows') }"></i>
                <i class="fab" :class="{ 'fa-linux large' : (minion.properties.kernel == 'Linux') }"></i>
                <strong>{{ minion.properties.host }}</strong>
            </span><br>
            <!-- Properties -->
            <span>
                <b-badge v-for="(role, index) in minion.properties.roles" :key="index">{{ role }}</b-badge>
            </span>
        </b-card>
        <b-card class="minioncard text-muted" v-if="minion.properties == null">
            <i class="fa fa-bed"></i>
            <strong>{{ minion.name }}</strong>
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
                if(this.state.auth.status == false){console.log("Not connected to API"); return false}
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
                        if (response['data']['return'] == undefined){console.debug("No recent jobs");return false}
                        // Once API call received
                        // TODO: Figure out a way to catch Salt Errors when no jobs are found
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
                            for (var key in query.Minions){
                                name = query.Minions[key]
                                // If the minion isn't included in the return data
                                // Push it as an non-returning minion
                                if (!query.Result[name]){
                                    this.minions.push({'name' : name, properties: null})
                                }
                            }
                            for (key in query.Result){
                                this.minions.push({'name': key, properties: query.Result[key].return})
                            }
                            console.debug('loaded minion data from recent job')
                            localStorage.setItem('minions', JSON.stringify(this.minions))
                            console.debug(difference)
                            return true
                        }
                        else console.debug("Data returned too old"); return false
                    } )
                    .catch((error) => {
                        console.error(error)
                        return false
                    })
            },
        startGrainsItems: function() {
            // If not authenticated
            if(this.state.auth.status == false){
                console.log('Not authenticated') 
                return false
                }
            // If queried too quickly
            var timediff = Date.now() - this.apilimit
            console.log(timediff)
            if( timediff < 90000 ){
                console.log("Querying too quickly")
                this.apilimit = this.apilimit + 10000
                return false
            }
            // Blank current object model and trigger loading spinner
            this.minions = []
            console.debug('launching startGrainsItems')
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
                        this.apilimit = Date.now() 
                        return true
                    } 
                    else {
                        return false
                    } 
                    })
        },
        initView: function() {
            console.debug('initView started')
            if(localStorage.getItem('minions')){
                console.debug('loading local storage')
                this.minions = JSON.parse(localStorage.getItem('minions'))
                return true
            }
            else { return false }
        },
        toggleSort: function(selection) {
            if (selection == 'alpha') { 
                if (this.sort == 'alphaSortUp'){ this.sort = 'alphaSortDown'; return }
                else {
                    this.sort = 'alphaSortUp'
                }
            }
            if (selection == 'response') {
                if (this.sort == 'responseSortUp'){ this.sort = 'responseSortDown'; return}
                else{
                    this.sort = 'responseSortUp'
                }
            }
            if (selection == 'os') {
                if (this.sort == 'osSortUp'){ this.sort = 'osSortDown'; return}
                else {
                    this.sort = 'osSortUp'
                }
            }
        },
        refreshGrains: function() {
            if(!this.loadMinions()){
                this.startGrainsItems()
            }
        }
    },
    data() {
        return {
           state: this.$root.sharedState.state,
           minions: [],
           sort: 'alphaSortDown',
           timer: null,
           apilimit: Date.now()
        }
    },
    created() {
        if (!this.initView()){this.loadMinions()}
        this.timer = setInterval(this.loadMinions(), 600000)
    },
    beforeDestroy() {
        clearInterval(this.timer)
    },
    computed: {
        minionSorted: function() {
            if (this.sort == 'alphaSortUp'){
                return this.minions.sort(function(a,b) {
                    if(a.name < b.name) return 1;
                    if(a.name > b.name) return -1;
                    return 0; 
                }
                )
            }
            if (this.sort == 'alphaSortDown'){
                return this.minions.sort(function(a,b) {
                    if(a.name < b.name) return -1;
                    if(a.name > b.name) return 1;
                    return 0; 
                }
                )
            }
            if (this.sort == 'responseSortUp'){
                return this.minions.sort(function(a,b) {
                    if(a.properties == null) return -1;
                    return 1;
                })
            }
            if (this.sort == 'responseSortDown'){
                return this.minions.sort(function(a,b) {
                    if(a.properties == null) return 1;
                    return -1;
                })
            }
            if (this.sort == 'osSortUp'){
                return this.minions.sort(function(a,b) {
                    if(a.properties == null || b.properties == null) return 2 
                    if(a.properties.kernel > b.properties.kernel) return 1
                    if(a.properties.kernel < b.properties.kernel) return -1
                    return 0;
                })
            }
             if (this.sort == 'osSortDown'){
                return this.minions.sort(function(a,b) {
                    if(a.properties == null || b.properties == null) return 2
                    if(a.properties.kernel > b.properties.kernel) return -1
                    if(a.properties.kernel < b.properties.kernel) return 1
                    return 0;
                })
            }
        },
        // minionsAlphaSortUp: function(){
        //     this.minions.sort(function(a,b) {
                     
        //     })
        // },
        // minionsAlphaSortDown: function(a,b) {
        //     this.minions.sort(function(a,b) {
        //         if (a.name < b.name) return 1;
        //         if (a.name > b.name) return -1;
        //         return 0;
        //     })
        // }
    }
}
</script>

<style>

</style>

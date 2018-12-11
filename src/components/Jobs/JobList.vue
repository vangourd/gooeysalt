<template>
    <b-col id="joblist">
        <b-navbar toggleable="sm" type="dark" variant="dark">
            <b-navbar-toggle target="jobs_collapse"></b-navbar-toggle>
            <b-navbar-brand class="fa fa-tasks"> Jobs</b-navbar-brand>
            <b-collapse is-nav id="jobs_collapse">
            <b-navbar-nav >
                <!-- Jobs Action Bar -->
                <b-nav-item @click="toggleSort('function')">
                    <i class="fa" :class="{
                        'fa-sort-up': this.sort == 'functionSortUp',
                        'fa-sort-down': this.sort == 'functionSortDown',
                        'fa-wrench': !this.sort.includes('function')
                    }"> Function</i>
                </b-nav-item>
                <b-nav-item @click="toggleSort('start')">
                    <i class="fa" :class="{
                        'fa-sort-up': this.sort == 'startSortUp',
                        'fa-sort-down': this.sort == 'startSortDown',
                        'fa-clock': !this.sort.includes('start')
                    }"> Start</i>
                </b-nav-item>
                <b-nav-item @click="toggleSort('result')">
                    <i class="fa" :class="{
                        'fa-sort-up': this.sort == 'resultSortUp',
                        'fa-sort-down': this.sort == 'resultSortDown',
                        'fa-check': !this.sort.includes('result')
                    }"> Result</i>
                </b-nav-item>
                <b-nav-item @click="toggleSort('target')">
                    <i class="fa" :class="{
                        'fa-sort-up': this.sort == 'targetSortUp',
                        'fa-sort-down': this.sort == 'targetSortDown',
                        'fa-bullseye': !this.sort.includes('target')
                    }"> Target</i>
                </b-nav-item>
                <b-nav-item @click="loadJobs"><i class="fa fa-undo"></i> Refresh</b-nav-item>
                <b-nav-item v-b-modal.filterModal><i class="fa fa-bars"></i> Open Filter List </b-nav-item>
            </b-navbar-nav>
            </b-collapse>
            <!-- Filters Modal Menu -->
            <b-modal id="filterModal" title="Filters Menu">
                    <strong>Job Window</strong>
                    <b-form-group>
                        From
                        <datepicker v-model="timeWindow.from" :bootstrap-styling="true"></datepicker>
                        To
                        <datepicker v-model="timeWindow.to" :bootstrap-styling="true"></datepicker>
                    </b-form-group>
                    <strong>Applied:</strong>
                    <ul>
                        <li style="list-style:none" v-for="(filter, index) in filters" :key="index">
                            <i class="fa" :class="{
                                'fa-bullseye': filter['type'] == 'Target',
                                'fa-wrench': filter['type'] == 'Function',
                                'fa-clock': filter['type'] == 'Datetime',
                            }"></i>
                            {{ index }} {{ filter['action'] }} {{ filter['type'] }} with "{{ filter['value'] }}"
                            <i style="color:red" class="fa fa-times" @click="filters.splice(index,1)"></i>
                        </li>
                    </ul>
                        <strong>Add:</strong><br>
                        <b-form-group>
                            
                            <b-dropdown :text="filterMenu.type">
                                <b-dropdown-item @click="filterMenu.type = 'Function'">Function</b-dropdown-item>
                                <b-dropdown-item @click="filterMenu.type = 'Target'">Target</b-dropdown-item>
                                <b-dropdown-item @click="filterMenu.type = 'Arguments'">Arguments</b-dropdown-item>
                                <b-dropdown-item @click="filterMenu.type = 'Daterange'">Daterange</b-dropdown-item>
                            </b-dropdown>
                            <b-input v-if="!(filterMenu.type == 'Daterange')" 
                                    placeholder="String" v-model="filterMenu.value">
                            </b-input>
                            
                            <b-btn :variant="this.filterMenu.variant" @click="addFilter">Add</b-btn>

                        </b-form-group>
            </b-modal>
        </b-navbar>
        <jobcreator></jobcreator>
        <job-item v-if="jobs.length > 0" v-for="job in filteredJobs" :job="job" :key="job.jid">
        </job-item>
        <b-alert variant="warning" v-if="filteredJobs.length == 0 && this.jobs.length != 0" show>
            <p>No jobs found based on your filters. Try opening our filter list and removing more filters.</p>
            <i class="fa fa-frown"></i>
        </b-alert>
        <spinner v-if="jobs.length == 0 && this.state.auth.status == true"></spinner>
        <h2 v-if=" this.state.auth.status == false">
            You are not authenticated
            <br>
            <br>
            <br>

        </h2>
    </b-col>
</template>

<script>
import axios from 'axios'
import Datepicker from 'vuejs-datepicker'
import JobItem from './JobItem.vue'
import Spinner from '../Spinner.vue'
import JobCreator from './JobCreator.vue'


export default {

    name: 'joblist',
    components: {
        'job-item': JobItem,
        'jobcreator': JobCreator,
        'spinner': Spinner,
        'datepicker': Datepicker
    },
    methods: {
        loadJobs: function() {
            if(this.state.auth.status == false){console.log('Not Connected to API'); return false}
            if(this.refreshLock == true){console.log("Waiting on query");return false}
            this.refreshLock = true
            // API CALL
            axios.post('https://' + this.state.auth.server + 
                ':' + this.state.auth.port + '/', {
                    client: "runner",
                    fun: "jobs.list_jobs",
                    start_time: this.timeWindow.from.toLocaleString(),
                    end_time: this.timeWindow.to.toLocaleString()
                },{
                headers: {
                    'x-auth-token': this.state.auth.token,
                    'content-type': 'application/json',
                    'accept': 'application/json'
                }
                        })
                    .then((response) => {
                        if (response['data']['return'] == undefined){console.debug('Invalid return for job data');return false}
                        var query = response['data']['return'][0]
                        // Create array from dat
                        this.jobs = []
                        for (var jid in query){
                            if (this.jobs.length > 0){
                                if (!this.jidInventory.includes(jid)){
                                    this.jobs.push({'jid':jid, 'properties': query[jid]})
                                }
                            }
                            else {
                                this.jobs.push({'jid': jid, 'properties': query[jid]})
                            }
                            
                        }
                        console.debug("Loaded job data from server")
                        localStorage.setItem('jobs', JSON.stringify(this.jobs))
                        this.filterJobs()
                        this.refreshLock = false
                    })
                    .catch((error) => {
                    console.error(error)
                    this.refreshLock = false
                })
        },
        toggleSort: function(selection) {
            if (selection == 'function') { 
                if (this.sort == 'functionSortUp'){ this.sort = 'functionSortDown';  }
                else {
                    this.sort = 'functionSortUp'
                }
            }
            if (selection == 'start') {
                if (this.sort == 'startSortUp'){ this.sort = 'startSortDown'; }
                else{
                    this.sort = 'startSortUp'
                }
            }
            if (selection == 'end') {
                if (this.sort == 'endSortUp'){ this.sort = 'endSortDown'; }
                else{
                    this.sort = 'endSortUp'
                }
            }
            if (selection == 'result') {
                if (this.sort == 'resultSortUp'){ this.sort = 'resultSortDown'; }
                else{
                    this.sort = 'resultSortUp'
                }
            }
            if (selection == 'target') {
                if (this.sort == 'targetSortUp'){ this.sort = 'targetSortDown'; }
                else{
                    this.sort = 'targetSortUp'
                }
            }
            this.filterJobs()
        },
        initView: function() {
            if (localStorage.getItem('jobs') ){
                this.jobs = JSON.parse(localStorage.getItem('jobs'))
                console.debug("Job data loaded from cache")
                return true
            }
            else return false
            console.debug("FAIL Job data not loaded from cache")
        },
        addFilter: function() {
            // If not enough info return right away
            if(this.filterMenu['type'] == "Choose filter type" || 
               this.filterMenu['value'].length == 0)
            {    
                this.filterMenu.variant = "danger"; return false
            }
            // Add filter to list
            if(this.filterMenu['type'] != "Daterange"){
                console.debug('Pushing filter' + this.filterMenu.value)
                this.filters.push({
                    'type':     this.filterMenu['type'],
                    'value':   this.filterMenu['value'],
                    'action':   this.filterMenu['action']})
                this.filterMenu.variant = "success"
            }
            if (this.filterMenu.action == 'Daterange'){
            }
            
        },
        filterJobs: function () {
            var staging = this.jobs

            console.debug('PreFilter Jobs length ' + this.jobs.length)

            for (var fi in this.filters){
               
                console.debug("Processing exclude filter " + this.filters[fi].value)
                for (var j in staging){
                    // If you match the filter you get ignored
                   if (staging[j].properties[this.filters[fi].type].includes(this.filters[fi].value)){
                       staging.splice(j,1)
                   } 
                }
            }

            console.debug('Exiting filter loop')
            console.debug(staging.length)

       
            // #### SORT LOGIC 
            if (this.sort == 'functionSortUp'){
                this.filteredJobs = staging.sort(function(a,b) {
                    if(a.properties.Function < b.properties.Function) return 1;
                    if(a.properties.Function > b.properties.Function) return -1;
                    return 0; 
                    }
                )
            }
            if (this.sort == 'functionSortDown'){
                this.filteredJobs = staging.sort(function(a,b) {
                    if(a.properties.Function > b.properties.Function) return 1;
                    if(a.properties.Function < b.properties.Function) return -1;
                    return 0; 
                    })
                
            }
            if (this.sort == 'startSortUp'){
                this.filteredJobs = staging.sort(function(a,b) {
                    if(a.properties.StartTime < b.properties.StartTime) return 1;
                    if(a.properties.StartTime > b.properties.StartTime) return -1;
                    return 0; 
                    })
            }
            if (this.sort == 'startSortDown'){
                this.filteredJobs = staging.sort(function(a,b) {
                    if(a.properties.StartTime > b.properties.StartTime) return 1;
                    if(a.properties.StartTime < b.properties.StartTime) return -1;
                    return 0; 
                    })
            }
            if (this.sort == 'targetSortUp'){
                this.filteredJobs = staging.sort(function(a,b) {
                    if(a.properties.Target < b.properties.Target) return 1;
                    if(a.properties.Target > b.properties.Target) return -1;
                    return 0; 
                })
            }
            if (this.sort == 'targetSortDown'){
                this.filteredJobs = staging.sort(function(a,b) {
                    if(a.properties.Target > b.properties.Target) return 1;
                    if(a.properties.Target < b.properties.Target) return -1;
                    return 0; 
                    })
            }
        }
    },
    data() {
        return {
            state: this.$root.sharedState.state,
            timer: '',
            jobs: [],
            filteredJobs: [],
            sort: 'startSortUp',
            filters: [
                {"type":"Function","value":"runner.jobs.list_jobs"}
            ],
            timeWindow: {
                'from': new Date(Date.now() - 86400000),
                'to': new Date(Date.now())
            },
            filterMenu: {
                "type": "Choose filter type", 
                "value": null,
                "action": "Include/Exclude",
                "variant": "primary",
            },
            navSelection: 'Sorts',
            refreshLock: false,
        }
    },
    created() {
        if(!this.initView()){this.loadJobs()}
        this.filterJobs()
        this.timer = setInterval(this.loadJobs, 40000)
    },
    beforeDestroy() {
        clearInterval(this.timer)
    },
    computed: {
        jidInventory: function () {
            if(this.jobs.length <= 0){ return }
            var jids = []
            this.jobs.forEach( function(job, index) {
                jids.push(job.jid)
            })
            return jids
        },
    },
}

</script>

<style scoped>
/* Style page content - use this if you want to push the page content to the right when you open the side navigation */
#joblist {
    padding-right:0px;
}
#searchResultList{
   width:100%;
   top:40px; 
   z-index:1;
   background-color:#597151;
   color:white;
   border-radius: 2px;
}
.searchResultItem{
    padding:5px;
}
.fa-frown {
    font-size:80px;
}
.full-add-button {
    width: 100%;
    border-radius:0
}

#collapseNewFilterButton{
    width:100%;
    border-radius: 0;
}
.validate-success{
    border-color: rgb(103, 165, 103);
}

.validate-fail{
    border-color: red;
}

</style>
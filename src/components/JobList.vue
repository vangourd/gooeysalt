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
                    <strong>Applied:</strong>
                    <ul>
                        <li style="list-style:none" v-for="(filter, index) in filters" :key="index">
                            <i class="fa" :class="{
                                'fa-bullseye': filter['type'] == 'Target',
                                'fa-wrench': filter['type'] == 'Function',
                                'fa-clock': filter['type'] == 'Datetime',
                            }"></i>
                            {{ index }} {{ filter['action'] }} {{ filter['type'] }} with "{{ filter['string'] }}"
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
                                    placeholder="String" v-model="filterMenu.text">
                            </b-input>
                            <b-form-group v-if="filterMenu.type == 'Daterange'">
                                <label>From</label>
                                <b-input :placeholder="new Date().toLocaleString()"></b-input>
                                <label>To</label>
                                <b-input :placeholder="new Date(
                                    new Date().setHours(
                                        new Date().getHours()-8
                                        ) 
                                    ).toLocaleString()">
                                </b-input>

                            </b-form-group>
                            <b-dropdown :text="filterMenu.action">
                                <b-dropdown-item @click="filterMenu.action = 'Include'">Include</b-dropdown-item>
                                <b-dropdown-item @click="filterMenu.action = 'Exclude'">Exclude</b-dropdown-item>
                            </b-dropdown>
                            <b-btn :variant="this.filterMenu.variant" @click="addFilter">Add</b-btn>

                        </b-form-group>
            </b-modal>
        </b-navbar>
        <jobcreator></jobcreator>
        <job-item v-if="jobs" v-for="job in jobsSorted" :job="job" :key="job.jid">
        </job-item>
        <b-alert variant="warning" v-if="jobsSorted.length == 0 && this.jobs.length != 0" show>
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
import JobItem from './JobItem.vue'
import Spinner from './Spinner.vue'
import JobCreator from './Jobs/JobCreator.vue'


export default {

    name: 'joblist',
    components: {
        'job-item': JobItem,
        'jobcreator': JobCreator,
        'spinner': Spinner
    },
    methods: {
        loadJobs: function() {
            if(this.state.auth.status == false){console.log('Not Connected to API'); return false}
            // API CALL
            axios.post('https://' + this.state.auth.server + 
                ':' + this.state.auth.port + '/', {
                    client: "runner",
                    fun: "jobs.list_jobs",
                    start_time: (
                        (
                            new Date(
                                Date.now() - (3600 * 1000)
                                )
                        ) 
                    
                        ).toLocaleString()
                },{
                headers: {
                    'x-auth-token': this.state.auth.token,
                    'content-type': 'application/json',
                    'accept': 'application/json'
                }
                        })
                    .then((response) => {
                        if (response['data']['return'] == undefined){console.debug('Invaild return for job data');return false}
                        var query = response['data']['return'][0]
                        // Create array from dat
                        this.jobs = []
                        for (var jid in query){
                            this.jobs.push({'jid': jid, 'properties': query[jid]})
                        }
                        console.debug("Loaded job data from server")
                        localStorage.setItem('jobs', JSON.stringify(this.jobs))
                    })
                    .catch((error) => {
                    console.error(error)
                })
        },
        toggleSort: function(selection) {
            if (selection == 'function') { 
                if (this.sort == 'functionSortUp'){ this.sort = 'functionSortDown'; return }
                else {
                    this.sort = 'functionSortUp'
                }
            }
            if (selection == 'start') {
                if (this.sort == 'startSortUp'){ this.sort = 'startSortDown'; return}
                else{
                    this.sort = 'startSortUp'
                }
            }
            if (selection == 'end') {
                if (this.sort == 'endSortUp'){ this.sort = 'endSortDown'; return}
                else{
                    this.sort = 'endSortUp'
                }
            }
            if (selection == 'result') {
                if (this.sort == 'resultSortUp'){ this.sort = 'resultSortDown'; return}
                else{
                    this.sort = 'resultSortUp'
                }
            }
            if (selection == 'target') {
                if (this.sort == 'targetSortUp'){ this.sort = 'targetSortDown'; return}
                else{
                    this.sort = 'targetSortUp'
                }
            }

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
               this.filterMenu['text'].length == 0)
            {    
                this.filterMenu.variant = "danger"; return false
            }
            // Add filter to list
            if(this.filterMenu['type'] != "Daterange"){
                console.debug('Pushing filter' + this.filterMenu.text)
                this.filters.push({
                    'type':     this.filterMenu['type'],
                    'string':   this.filterMenu['text'],
                    'action':   this.filterMenu['action']})
                this.filterMenu.variant = "success"
            }
            if (this.filterMenu.action == 'Daterange'){
                this.filterMenu.daterange.set = !this.filterMenu.daterange.set
            }
            
        }
    },
    data() {
        return {
            state: this.$root.sharedState.state,
            timer: '',
            jid: null,
            jobs: [],
            sort: 'functionSortUp',
            filters: [],
            filterMenu: {
                "type": "Choose filter type", 
                "text": "",
                "daterange": {
                    "from": {
                        "date": new Date(Date.now() - 86400000).toISOString().slice(0,10),
                        "time": new Date(Date.now() - 86400000).toTimeString().slice(0,8)
                    },
                    "to": {
                        "date": new Date(Date.now()).toISOString().slice(0,10),
                        "time": new Date().toTimeString().slice(0,8)
                    },
                    "set": false
                },
                "action": "Include/Exclude",
                "variant": "primary",
            },
            navSelection: 'Sorts',
            searchQuery: null,
            testData: null,
        }
    },
    created() {
        if(!this.initView()){this.loadJobs()}
        this.timer = setInterval(this.loadJobs, 40000)
    },
    beforeDestroy() {
        clearInterval(this.timer)
    },
    computed: {
        
        jobsSorted: function() {
            
            var filteredjobs = []
            var start = new Date( this.filterMenu.daterange['from']['time'] + ' ' + 
                        this.filterMenu.daterange['from']['date'] )

            var end = new Date(this.filterMenu.daterange['to']['time'] + ' ' +
                        this.filterMenu.daterange['to']['date'] )

            if(start == 'Invalid Date' || end == 'Invalid Date'){console.log('Invalid date range'); return}
            if (this.filters.length <= 0){console.debug('No filters applied');return this.jobs}

            for (var job in this.jobs){
                var jobstart = new Date(this.jobs[job]['properties']['StartTime'])
                var jobend = new Date(this.jobs[job]['properties']['StartTime'])
                if(jobstart == 'Invalid Date'){console.debug(job.jid = 'Had invalid date'); continue}
                if(jobend == 'Invalid Date'){console.debug(job.jid = 'Had invalid date'); continue}
                // Skip jobs outside of our desired date range
                if (jobstart <= start){
                    console.debug("Job occurs before start range")
                    continue 
                }
                if (jobend >= end){
                    console.debug("Job occurs after end range")
                    continue 
                }
                // Start applying filters
                for (var filter in this.filters){
                    // Skip datefilters as they've already been applied
                    // Functions && Targets matching a string
                    var jobFunction = this.jobs[job]['properties'][this.filters[filter]['type']]
                    console.debug(jobFunction)
                    if (jobFunction.includes(filter['string'])){
                        console.debug('Job ' + job.jid + ' passed filter ' + filter.type + filter.string)
                        filteredjobs.push(job)
                    }
                }

            }
            console.debug('Exiting initial loop')

        //   // #### FILTER LOGIC ####
        //     if(this.filters.length > 0){
        //         // Copy the jobs requested from server
        //         var unfilteredJobData = this.jobs
        //         var targets = []
        //         var funs = []
        //         var datetime = {
        //             'start': new Date(Date.now() - 36000000,),
        //             'end': new Date()
        //             }
        //         // Pull our selected targets from menu object
        //         for (var filter in this.filters) {
        //            // If this isn't a target filter skip
        //             if (this.filters[filter].type != 'Target'){ continue }
        //             // If it is see if it has already been added
        //             if ( (!targets.includes(this.filters[filter].string) && (this.filters[filter].behavior === 'Include')  )){
        //                 console.debug(this.filters[filter].behavior)
        //                 targets.push(this.filters[filter].string)
        //             }
        //         }   
        //         console.debug('Targets: ' + targets.length)

        //         // Pull our selected functions from menu object 
        //         for (var filter in this.filters) {
        //             if (this.filters[filter].type != 'Function'){ continue }
        //             if ( (!funs.includes(this.filters[filter].string)  && (this.filters[filter].behavior === 'Include')     )){
        //                 funs.push(this.filters[filter].string)
        //             }
        //         }
        //         console.debug('Functions: ' + funs.length)

        //         // Get earliest datetime and latest datetime assign to end result range
        //         for (var filter in this.filters) {
        //             if (this.filters[filter].type != 'Datetime'){ continue }
        //             try{ var newdate = new Date(this.filters[filter].string) }
        //             catch(err) {
        //                 console.debug(err)
        //                 continue
        //             }
        //             if (newdate < datetime.start) {
        //                 datetime.start = newdate
        //             }
        //             if (newdate > datetime.end) {
        //                 datetime.end = newdate
        //             }
        //         }
        //         // Start by removing jobs that do not have the selected targets
        //         var filteredjobs = []
        //         for (var jobnum in unfilteredJobData){
        //             // If targets do not match skip adding to results
        //             if (!targets.includes(unfilteredJobData[jobnum].properties.Target)){
        //                 // If there aren't any function selectors then move on
        //                 if (targets.length > 0){
        //                     console.debug('Filtered because of targets')
        //                     continue 
        //                 }
        //             }
        //             // If functions do not match skip adding to results
        //             if (!funs.includes(unfilteredJobData[jobnum].properties.Function)){
        //                 // If there aren't any function selectors then move on
        //                 if (funs.length > 0) { 
        //                     console.debug(unfilteredJobData[jobnum].properties.Function)
        //                     console.debug('Filtered because of function')
        //                     continue 
        //                 }
        //             }
        //             // If start time is before range or after range skip adding to results
        //             if (unfilteredJobData[jobnum].properties.StartTime < datetime.start || 
        //                 unfilteredJobData[jobnum].properties.StartTime > datetime.end){
        //                 console.debug('Filtered because of date')
        //                 continue
        //             }
        //             filteredjobs.push(unfilteredJobData[jobnum])
        //         }

        //         }
            // else {
            //     filteredjobs = this.jobs
            // }

            // #### SORT LOGIC 
            if (this.sort == 'functionSortUp'){
                return filteredjobs.sort(function(a,b) {
                    if(a.properties.Function < b.properties.Function) return 1;
                    if(a.properties.Function > b.properties.Function) return -1;
                    return 0; 
                    }
                )
            }
            if (this.sort == 'functionSortDown'){
                return filteredjobs.sort(function(a,b) {
                    if(a.properties.Function > b.properties.Function) return 1;
                    if(a.properties.Function < b.properties.Function) return -1;
                    return 0; 
                    })
                
            }
            if (this.sort == 'startSortUp'){
                return filteredjobs.sort(function(a,b) {
                    if(a.properties.StartTime < b.properties.StartTime) return 1;
                    if(a.properties.StartTime > b.properties.StartTime) return -1;
                    return 0; 
                    })
            }
            if (this.sort == 'startSortDown'){
                return filteredjobs.sort(function(a,b) {
                    if(a.properties.StartTime > b.properties.StartTime) return 1;
                    if(a.properties.StartTime < b.properties.StartTime) return -1;
                    return 0; 
                    })
            }
            if (this.sort == 'targetSortUp'){
                return filteredjobs.sort(function(a,b) {
                    if(a.properties.Target < b.properties.Target) return 1;
                    if(a.properties.Target > b.properties.Target) return -1;
                    return 0; 
                })
            }
            if (this.sort == 'targetSortDown'){
                return filteredjobs.sort(function(a,b) {
                    if(a.properties.Target > b.properties.Target) return 1;
                    if(a.properties.Target < b.properties.Target) return -1;
                    return 0; 
                    })
            }
            
        }
    }
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

</style>
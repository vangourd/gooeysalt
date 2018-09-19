<template>
    <b-col id="joblist">
        <b-navbar toggleable="sm" type="dark" variant="dark">
            <b-navbar-toggle target="jobs_collapse"></b-navbar-toggle>
            <b-navbar-brand class="fa fa-tasks"> Jobs</b-navbar-brand>
            <b-dropdown :text="navSelection">
                    <b-dropdown-item @click = "navSelection = 'Sorts'">Sorts</b-dropdown-item>
                    <b-dropdown-item @click = "navSelection = 'Actions'">Actions</b-dropdown-item>
                    <b-dropdown-item @click = "navSelection = 'Filters'">Filters</b-dropdown-item>
            </b-dropdown>
            <b-collapse is-nav id="jobs_collapse">
            <b-navbar-nav v-if="navSelection == 'Sorts'">
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
            </b-navbar-nav>
            <!-- Filter results autocomplete -->
            <b-navbar-nav v-if="navSelection == 'Filters'">
                <b-nav-form class="position-relative">
                    <b-dropdown :text="filterMenu['type']" variant="light">
                    <b-dropdown-item class="fa fa-wrench" @click.stop = "filterMenu['type'] = 'Function'"> Function</b-dropdown-item>
                    <b-dropdown-item class="fa fa-clock" @click.stop = "filterMenu['type'] = 'Datetime'"> Date</b-dropdown-item>
                    <b-dropdown-item class = "fa fa-bullseye" @click.stop = "filterMenu['type'] = 'Target'"> Target</b-dropdown-item>
                    </b-dropdown>
                    <b-input v-model="filterMenu['text']"></b-input>
                    <b-btn variant="secondary" @click="addFilter">Add</b-btn>
                    
                </b-nav-form>
                <b-nav-item v-b-modal.filterModal><i class="fa fa-bars"></i> Open Filter List </b-nav-item>
            </b-navbar-nav>
            <b-navbar-nav v-if="navSelection == 'Actions'">
                <b-nav-item @click="loadJobs"><i class="fa fa-undo"></i> Refresh</b-nav-item>
            </b-navbar-nav>
            </b-collapse>
            <b-modal id="filterModal">
                    <strong>Applied Filters</strong>
                    <ul>
                        <li style="list-style:none" v-for="(filter, index) in filters" :key="index">
                            <i class="fa" :class="{
                                'fa-bullseye': filter['type'] == 'Target',
                                'fa-wrench': filter['type'] == 'Function',
                                'fa-clock': filter['type'] == 'Datetime',
                            }"></i>
                            {{ filter['type'] }} with "{{ filter.string }}"
                            <i style="color:red" class="fa fa-times" @click="filters.splice(index,1)"></i>
                        </li>
                    </ul>
            </b-modal>
        </b-navbar>
        <job-item v-if="jobs" v-for="job in jobsSorted" :job="job" :key="job.jid">
        </job-item>
        <spinner v-if="jobs.length == 0"></spinner>
    </b-col>
</template>

<script>
import axios from 'axios'
import JobItem from './JobItem.vue'
import Spinner from './Spinner.vue'


export default {

    name: 'joblist',
    components: {
        'job-item': JobItem,
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
            if(this.filterMenu['type'] == "Choose filter type" || this.filterMenu['text'].length == 0) return false
            // Add filter to list
            this.filters.push({'type':this.filterMenu['type'],'string':this.filterMenu['text']})
            return true
    
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
            filterMenu: {"type": "Choose filter type", "text": ""},
            navSelection: 'Sorts',
            searchQuery: null,
            testData: null,
        }
    },
    created() {
        if(!this.initView()){this.loadJobs()}
        this.timer = setInterval(this.loadJobs, 60000)
    },
    beforeDestroy() {
        clearInterval(this.timer)
    },
    computed: {
        jobsSorted: function() {

            var filteredjobs = []
            console.debug('Filtered job length is ' + filteredjobs.length)
            if(this.filters.length > 0){
                for (var filter in this.filters){
                    // if (filter.type == 'verbosity'){
                    
                    // }
                    if (this.filters[filter].type == 'Target') {
                        var start = this.jobs
                        var end = []
                        for (var job in start){
                            if (start[job].properties.Target.includes(this.filters[filter]['string']) ){
                                filteredjobs.push(start[job])
                            }
                        }
                        //console.debug(remove)
                        //for (var i in remove){
                        //    console.debug('Removing ' + remove[i])
                        //    filteredjobs.splice(remove[i],1)
                        //}
                        console.debug("Filtered job lenght post filter is" + filteredjobs.length)
                    }
                //     if (filter.type == 'starttime'){

                //     }
                //     if (filter.type == 'function'){

                //     }
                //     if (filter.type == 'result'){
                        
                //     }
                // }
                }
            }
            else {
                filteredjobs = this.jobs
            }
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

</style>
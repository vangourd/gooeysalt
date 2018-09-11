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
                        'fa-clock': !this.sort.includes('result')
                    }"> Result</i>
                </b-nav-item>
                <b-nav-item @click="toggleSort('target')">
                    <i class="fa" :class="{
                        'fa-sort-up': this.sort == 'targetSortUp',
                        'fa-sort-down': this.sort == 'targetSortDown',
                        'fa-clock': !this.sort.includes('target')
                    }"> Target</i>
                </b-nav-item>
            </b-navbar-nav>
            <b-navbar-nav v-if="navSelection == 'Filters'">
                <b-nav-item v-b-modal.filterModal><i class="fa fa-list"></i> Show Active Filters</b-nav-item>
                <b-nav-form>
                    <b-form-input placeholder="Quick Add"></b-form-input>
                </b-nav-form>
            </b-navbar-nav>
            <b-navbar-nav v-if="navSelection == 'Actions'">
                <b-nav-item><i class="fa fa-undo"></i> Refresh</b-nav-item>
            </b-navbar-nav>
            </b-collapse>
            <b-modal id="filterModal">
                    <b-nav-form>
                        <b-form-input placeholder="Add Filter"></b-form-input>
                    </b-nav-form>
                    <strong>Applied Filters</strong>
                    <ul>
                        <li style="list-style:none" v-for="(filter, index) in filters" :key="index">
                            <i class="fa" :class="{
                                'fa-bullseye': filter.type == 'target',
                                'fa-wrench': filter.type == 'function'
                            }"></i>
                            {{ filter.string }} applied on {{ filter.type }}
                            <i style="color:red" class="fa fa-times" @click="filters.splice(index,1)""></i>
                        </li>
                    </ul>
            </b-modal>
        </b-navbar>
        <job-item v-if="jobs" v-for="job in jobsSorted" :job="job" :key="job.jid">
        </job-item>
        <spinner v-if="!jobs"></spinner>
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
    },
    data() {
        return {
            state: this.$root.sharedState.state,
            timer: '',
            jid: null,
            jobs: [],
            sort: 'functionSortUp',
            filters: [],
            navSelection: 'Sorts'
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
            if (this.sort == 'functionSortUp'){
                return this.jobs.sort(function(a,b) {
                    if(a.properties.Function < b.properties.Function) return 1;
                    if(a.properties.Function > b.properties.Function) return -1;
                    return 0; 
                }
                )
            }
            if (this.sort == 'functionSortDown'){
                return this.jobs.sort(function(a,b) {
                    if(a.properties.Function > b.properties.Function) return 1;
                    if(a.properties.Function < b.properties.Function) return -1;
                    return 0; 
                }
                )
            }
            if (this.sort == 'startSortUp'){
                return this.jobs.sort(function(a,b) {
                    if(a.properties.StartTime < b.properties.StartTime) return 1;
                    if(a.properties.StartTime > b.properties.StartTime) return -1;
                    return 0; 
                }
                )
            }
            if (this.sort == 'startSortDown'){
                return this.jobs.sort(function(a,b) {
                    if(a.properties.StartTime > b.properties.StartTime) return 1;
                    if(a.properties.StartTime < b.properties.StartTime) return -1;
                    return 0; 
                }
                )
            }
            if (this.sort == 'targetSortUp'){
                return this.jobs.sort(function(a,b) {
                    if(a.properties.Target < b.properties.Target) return 1;
                    if(a.properties.Target > b.properties.Target) return -1;
                    return 0; 
                }
                )
            }
            if (this.sort == 'targetSortDown'){
                return this.jobs.sort(function(a,b) {
                    if(a.properties.Target > b.properties.Target) return 1;
                    if(a.properties.Target < b.properties.Target) return -1;
                    return 0; 
                }
                )
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
</style>
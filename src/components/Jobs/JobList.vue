<template>
    <b-col id="joblist">
        <b-navbar id="jobsActionBar" toggleable="sm" type="dark" variant="dark">
            <b-navbar-toggle target="jobs_collapse"></b-navbar-toggle>
            <b-navbar-brand class="fa fa-tasks"> Jobs</b-navbar-brand>
            <b-collapse is-nav id="jobs_collapse">
            <b-navbar-nav>
                <b-nav-item @click="sortByFunction()">
                    <i class="fa" :class="{
                        'fa-sort-up': this.actionBar.sort == 'functionUp',
                        'fa-sort-down': this.actionBar.sort == 'functionDown',
                        'fa-wrench': !this.actionBar.sort.includes('function')
                    }"> Function</i>
                </b-nav-item>
                <b-nav-item @click="sortByStart()">
                    <i class="fa" :class="{
                        'fa-sort-up': this.actionBar.sort == 'startUp',
                        'fa-sort-down': this.actionBar.sort == 'startDown',
                        'fa-clock': !this.actionBar.sort.includes('start')
                    }"> Start</i>
                </b-nav-item>
                <b-nav-item>
                    <i class="fa" :class="{
                        'fa-sort-up': this.actionBar.sort == 'resultUp',
                        'fa-sort-down': this.actionBar.sort == 'resultDown',
                        'fa-check': !this.actionBar.sort.includes('result')
                    }"> Result</i>
                </b-nav-item>
                <b-nav-item @click="sortByTarget()">
                    <i class="fa" :class="{
                        'fa-sort-up': this.actionBar.sort == 'targetUp',
                        'fa-sort-down': this.actionBar.sort == 'targetDown',
                        'fa-bullseye': !this.actionBar.sort.includes('target')
                    }"> Target</i>
                </b-nav-item>
                <b-nav-item @click="refresh()">
                    <!--TODO: Fix this <i class="fa fa-undo" v-if="!refreshLock "></i> -->
                    <i class="fa fa-spinner"></i>
                    Refresh
                </b-nav-item>
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
        <job-pending v-if="jobs.active.length > 0" v-for="job in jobs.active" :job="job" :key="job.jid">
        </job-pending>
        <job-item v-if="jobs.complete.length > 0" v-for="job in jobs.complete" :job="job" :key="job.jid">
        </job-item>
        <div id="statusList">
            <spinner v-if="jobs.complete.length == 0 && this.state.auth.status == true"></spinner>
            <b-alert id="authWarning" variant="warning" v-if=" this.state.auth.status == false">
                You are not authenticated
            </b-alert>
        </div>
    </b-col>
</template>

<script>
import axios from 'axios'
import Datepicker from 'vuejs-datepicker'
import JobItem from './JobItem.vue'
import JobPending from './JobPending.vue'
import Spinner from '../Spinner.vue'
import JobCreator from './JobCreator.vue'
import SaltClient from '../../SaltClient.js'
import SaltJobs from '../../SaltJobs.js'


export default {

    name: 'joblist',
    components: {
        'job-item': JobItem,
        'job-pending': JobPending,
        'jobcreator': JobCreator,
        'spinner': Spinner,
        'datepicker': Datepicker
    },
    data() {
        return {
            state: this.$root.sharedState.state,
            jobs: {
                'complete': [],
                'active': [],
            },
            actionBar: {
                sort: "startUp"
            },
            filteredJobs: [],
            filters: [
                {"type":"Function","value":"runner.jobs.list_jobs"}
            ],
            timeWindow: {
                'from': new Date(Date.now() - 360000 /*86400000*/),
                'to': new Date(Date.now())
            },
            filterMenu: {
                "type": "Choose filter type", 
                "value": null,
                "action": "Include/Exclude",
                "variant": "primary",
            },
            navSelection: 'Sorts',
            salt: null,
            setupInterval: false
        }
    },
    created() {
        this.setupInterval = setInterval(this.setupClients, 2000)
    },
    beforeDestroy() {
    },
    methods: {

        refresh(){
            this.salt.jobs.active.get()
            this.salt.jobs.complete.getRecent()
        },
        connectedToApi(){
            if(typeof(this.state.auth.status) == 'boolean')
                return this.state.auth.status
        },

        setupClients(){
            if(this.connectedToApi()){
                clearInterval(this.setupInterval)
                console.debug('Authenticated. Setting up clients...')
                this.salt = new SaltJobs(this.state.auth,this.jobs.complete,this.jobs.active)
                if(!this.loadJobsFromStorage()) {
                    console.debug("No local storage data. Querying server...")
                    this.refresh()
                }
            }
            else{
                console.debug('Not authenticated. Waiting...')
            }
           
        },

        loadJobsFromStorage: function(){
            if(localStorage.getItem('activeJobs')){
                console.debug("Active jobs loaded from cache")
                this.jobs.active = JSON.parse(localStorage.getItem('activeJobs'))
            }
            if (localStorage.getItem('jobs') ){
                console.debug("Job data loaded from cache")
                this.jobs.complete = JSON.parse(localStorage.getItem('jobs'))
                return true
            }
            else return false
        },

        sortByFunction () {

            if(this.actionBar.sort === 'functionUp'){
                this.actionBar.sort = 'functionDown'
                this.jobs.complete =  this.saltjobs.sort.functionDown(this.jobs.complete)
            }
            else{
                this.actionBar.sort = 'functionUp'
                this.jobs.complete = this.saltjobs.sort.functionUp(this.jobs.complete)
            }
        },

        sortByStart () {
            if(this.actionBar.sort === 'startUp'){
                this.actionBar.sort = 'startDown'
                this.jobs.complete = this.saltjobs.sort.startUp(this.jobs.complete)
            }
            else{
                this.actionBar.sort = 'startUp'
                this.jobs.complete = this.saltjobs.sort.startDown(this.jobs.complete)
            }
        },

        sortByTarget () {
            if(this.actionBar.sort === 'targetUp'){
                this.actionBar.sort = 'targetDown'
                this.jobs.complete = this.saltjobs.sort.targetUp(this.jobs.complete)
            }
            else{
                this.actionBar.sort = 'targetUp'
                this.jobs.complete = this.saltjobs.sort.targetDown(this.jobs.complete)
            }
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

        // TODO: Refactor this. Move to external library
        filterJobs: function (){
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

        },
    },
    computed: {
        
        
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
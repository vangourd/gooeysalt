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
                    <i class="fa fa-spinner"> Refresh</i>
                    
                </b-nav-item >
                <b-nav-item @click="changeTimeChoice()" id="timeControl">
                    <!--TODO: Fix this <i class="fa fa-undo" v-if="!refreshLock "></i> -->
                    <i class="fa fa-clock"> Time: {{ actionBar.time.choices[actionBar.time.choice] }}</i>
                </b-nav-item>
            </b-navbar-nav>
            <b-navbar-nav class="ml-auto">
                    <b-nav-form class="searchcontainer">
                        <b-form-input
                            @keydown.prevent @change="searchJobs"
                            v-model="actionBar.search.raw" 
                            type="text" 
                            placeholder="Search jobs">
                        </b-form-input>
                    </b-nav-form>
            </b-navbar-nav>
            </b-collapse>
            <!-- Filters Modal Menu -->
            
            
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
    },
    data() {
        return {
            state: this.$root.sharedState.state,
            jobs: {
                'complete': [],
                'active': [],
            },
            actionBar: {
                sort: "startUp",
                time: {
                    'from': (new Date(Date.now() - 360000 /*86400000*/)).toLocaleString(),
                    'to': (new Date(Date.now())).toLocaleString(),
                    'fromValid': 'secondary',
                    'toValid': 'secondary',
                    'choices':['10m','1hr','8hr','24hr','72hr','Custom'],
                    'choice': 0
                },
                search: {
                    'raw': "",
                    'obj': null
                }
            },
            saltjobs: null,
            setupInterval: false,
            timeScale: this.createTimeRange('10m')
        }
    },
    created() {
        this.setupInterval = setInterval(this.setupClients, 2000)
    },
    beforeDestroy() {
        this.saveHistoryToStorage()
    },
    methods: {

        setupClients(){
            if(this.connectedToApi()){
                clearInterval(this.setupInterval)
                this.saltjobs = new SaltJobs({
                    'auth': this.state.auth,
                    'complete': this.jobs.complete,
                    'active': this.jobs.active,
                    'timeScale': this.timeScale
                })
                if(!this.loadHistoryFromStorage()) {
                    this.refresh()
                }
            }
        },

        refresh(){
            this.saltjobs.jobs.active.get()
            this.saltjobs.jobs.complete.getByDate()
        },

        connectedToApi(){
            if(typeof(this.state.auth.status) == 'boolean')
                return this.state.auth.status
        },

        loadHistoryFromServer: function() {
            this.saltjobs.jobs.complete.getByDate()
        },

        loadHistoryFromStorage: function(){
            if(localStorage.getItem('jobsComplete')){
                var jobs = JSON.parse(localStorage.getItem('jobsComplete'))
                this.jobs.complete.length = 0
                this.jobs.complete.push.apply(this.jobs.complete,jobs)
                return true
            }

            else return false
        },

        saveHistoryToStorage: function() {
            // TODO: Have this occur before any possible mutation. E.g. when api updates
            if(this.jobs.complete.length > 0){
                var jobsComplete = JSON.stringify(this.jobs.complete)
                localStorage.setItem('jobsComplete', jobsComplete)
            }
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

        hasValidDate: function(date){
            try {
                var test = new Date(date)
                if(test instanceof Date && !isNaN(test)){
                    return true
                }
                else {
                    return false
                }
            }
            catch(err) {
                console.debug(err)
                return false
            }
        },

        changeTimeChoice: function() {
            // TODO: add +1 to timeChoice ad return to 0 when cycled
            if (this.actionBar.time.choice >= (this.actionBar.time.choices.length - 2) ){
                this.actionBar.time.choice = 0
            }
            else {
                this.actionBar.time.choice += 1
            }
            var newtime = this.createTimeRange(this.actionBar.time.choices[this.actionBar.time.choice])
            this.timeScale.from = newtime.from
            this.timeScale.to = newtime.to

        },

        createCustomTimeRange: function() {
            this.actionBar.time.choice = this.actionBar.time.choices.length - 1
        },

        createTimeRange: function(choice) {
            let convertToMilliseconds = {
                '10m': 600000,
                '1hr': 3.6e+6,
                '8hr': 2.88e+7,
                '24hr': 8.64e+7,
                '72hr': 2.592e+8,
                '1wk': 6.048e+8
            }
            var timeObj =
            {
                'from': (new Date(Date.now() - convertToMilliseconds[choice])),
                'to': (new Date(Date.now()))
            }
            if (this.hasValidDate(timeObj.from) && this.hasValidDate(timeObj.to)){
                return timeObj
            }
            else {
                throw {
                    'name': "DateFormatError",
                    "message": "Date validation failed"
                }
            }
        },

        searchJobs: function() {
            this.actionBar.search.obj = this.parseSearchQuery(this.actionBar.search.raw)
        },

        // TODO: Need to handle situation when no match is found
        parseSearchQuery: function(query) {
            // function
            var matches = []
            var result = {}
            matches.push({"name":"fun", "reg": new RegExp(/fun:(\S+)/) })
            matches.push({"name":"target", "reg": new RegExp(/tgt:(\S+)/) })
            matches.push({"name":"start", "reg": new RegExp(/start:(\S+)/) })
            matches.push({"name":"user", "reg": new RegExp(/user:(\S+)/) })
            matches.push({"name":"from", "reg": new RegExp(/from:(\S+)/) })
            matches.push({"name":"to", "reg": new RegExp(/to:(\S+)/) })

            for (var i in matches){
                if(matches[i].reg.test(query)){
                    result[matches[i].name] = matches[i].reg.exec(query)[1]
                }
                else {
                    result[matches[i].name] = false
                }
            }

            return result
            
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

</style>
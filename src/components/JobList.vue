<template>
    <b-col id="joblist">
        <h2>Recent Jobs <span class="text-secondary">{{Object.keys(jobs).length}}</span></h2>
            <job-item v-if="jobs" v-for="(job, index) in jobs" :job="job" :jid="jobs[index]" :key="index">
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
                if(this.state.auth.status == true){ 
                console.debug("Server" + this.state.auth.server)
                console.debug("Port" + this.state.auth.port)
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
                     .then((response) => this.jobs = response.data.return[0] )
                     .catch((error) => {
                        console.error(error)
                    })
                }

                    // NOT WORKING
                    // this.requestURL = ('https://' + this.state.auth.server + 
                    //             ':' + this.state.auth.port + '/jobs');
                    // this.requestData = {
                    //             //client: 'local',
                    //             //tgt: '*',
                    //             //fun: 'jobs.list_jobs', 
                    //             //token: this.state.auth.token,
                    // },
                    // this.requestConfig = { headers: {
                    //     'Accept': 'application/json',
                    //     'Content-Type': 'application/json',
                    //     'x-auth-token': this.state.auth.token,
                    //     }
                    // };
                    // axios.get(this.requestURL, this.requestConfig)
                    //     .then((response) =>  (this.jobs) ? this.jobs = response : this.jobs = false )
                    //     .catch((error) => {
                    //         console.error(error)
                    //     })
               // }
            },
    },
    data() {
        return {
            state: this.$root.sharedState.state,
            timer: '',
            jid: null,
            jobs: null,
            requestHeaders: '',
            requestData: '',
            requestURL: '',
        }
    },
    created() {
        this.loadJobs()
        this.timer = setInterval(this.loadJobs, 10000)
        console.log(this.state.auth.server)
    },
    beforeDestroy() {
        clearInterval(this.timer)
    }
}

</script>

<style scoped>
/* Style page content - use this if you want to push the page content to the right when you open the side navigation */
#joblist {
    transition: margin-left .5s;
    padding: 20px;
}
</style>
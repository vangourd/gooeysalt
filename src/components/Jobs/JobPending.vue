<template>
    <b-card class="job-card" >
        <b-row>
            <b-col cols="10">
                    <strong>{{ job.properties.Function }}</strong> on {{ job.properties.Target }}
                    <p class="small text-secondary">
                        by <i class="fa fa-user"></i> {{ job.properties.User }} {{ job.properties.StartTime }} <br>
                        Minions at task: {{ job.properties.Running.length }}
                        Minions returned: {{ job.properties.Returned.length }} <br>
                    </p>
                    <b-progress :value="job.properties.Returned.length" :max="TotalTaskedMinions" show-progress animated></b-progress>
            </b-col>
            <b-col cols="2">
                <b-btn variant="light" :to="{ name: 'jobdetail', params: { jid: job.jid, job: job}}" 
                        class="fa fa-download big">
                </b-btn>
            </b-col>
        </b-row>
    </b-card>
</template>

<script>
import axios from 'axios'

export default {
    name: 'job-pending',
    props: ['job'],
    data() {
        return {
            state: this.$root.sharedState.state,
            apiTime: Date.now(),
            jobQuery: null
        }
    },
    methods: {
        queryProgress: function() {
            axios.post('https://' + this.state.auth.server + 
                ':' + this.state.auth.port + '/', {
                    client: "runner",
                    fun: "jobs.lookup_jid",
                    arg: this.jid
                },{
                headers: {
                    'x-auth-token': this.state.auth.token,
                    'content-type': 'application/json',
                    'accept': 'application/json'
                }
                        })
                    .then((response) => {
                        this.jobQuery = response
                       console.debug('From jobpending ' + response)
                    })
                    .catch((error) => {
                        console.debug(error)       
                    })
        }
    },
    created(){
        this.queryProgress()
    },
    computed: {
        TotalTaskedMinions: function() {
            return this.job.properties.Returned.length + this.job.properties.Running.length
        }
    }
}
</script>

<style scoped>
    .job-card{
        background-color:whitesmoke;
    }
    .job-card p {
        margin:0;
        padding:0;
    }
</style>
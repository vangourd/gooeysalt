<template>
    <b-card class="job-card">
        <b-row>
            <b-col cols="10">
                    <strong>{{ job.properties.Function }}</strong> on {{ job.properties.Target }}
                    <p class="small text-secondary">
                        {{ job.properties.StartTime }} <br>
                    
                    <b-collapse v-model="showJobData" :id=" 'collapse' + job.jid">
                        <p v-if="!this.jobData">Loading...</p>
                        <p>
                            {{ jobData }}
                        </p>
                    </b-collapse>
                    </p>
            </b-col>
            <b-col cols="2">
                <i @click="loadJobData" class="fa fa-download big"></i>
            </b-col>
        </b-row>
    </b-card>
</template>

<script>
import axios from 'axios'

export default {
    name: 'job-item',
    props: ['job'],
    data() {
        return {
            state: this.$root.sharedState.state,
            showJobData: null,
            jobData: null,
            apiTime: Date.now()
        }
    },
    methods: {
        loadJobData: function(){
            if(this.jobData){console.debug('Job data loaded'); showJobData = !showJobData;return true}
            axios.post('https://' + this.state.auth.server + 
                    ':' + this.state.auth.port + '/', {
                        client: "runner",
                        fun: "jobs.lookup_jid",
                        jid: this.job.jid
                    },{
                        headers: {
                            'x-auth-token': this.state.auth.token,
                            'content-type': 'application/json',
                            'accept': 'application/json'
                        }
                    })
                    .then((response) => {
                        this.jobData = response['data']['return'][0]
                    })
                    .catch((error) => {
                        console.debug(error)
                        return false
                    })
        }
    }
}
</script>

<style scoped>
    .job-card p {
        margin:0;
        padding:0;
    }
</style>
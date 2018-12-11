<template>
    <b-card class="job-card">
        <b-row>
            <b-col cols="10">
                    {{ jid }}
            </b-col>
            <b-col cols="2">
                
            </b-col>
        </b-row>
    </b-card>
</template>

<script>
import axios from 'axios'

export default {
    name: 'job-pending',
    props: ['jid'],
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
    }
}
</script>

<style scoped>
    .job-card p {
        margin:0;
        padding:0;
    }
</style>
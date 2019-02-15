<template>
    <b-container>
        <b-row v-if="state.auth.status">
            <b-col>
            <b-btn @click="$router.go(-1)">Return </b-btn>
            <b-btn @click="loadData">Refresh <i class="fa fa-undo"></i></b-btn>
            <div v-if="job">
                <h2><strong> {{ job.properties.Function}}</strong> on {{ job.properties.Target }} </h2>
                <a :href="'data:' + downloadData" download="data.json">download JSON</a>
                {{ job.jid }}
                <br>
                <h3>Return data</h3>
                <b-card v-for="(index, entry) in jobReturn" :key="index" f>
                    <b-card-title>{{entry}}</b-card-title>
                    <b-card-body>
                        {{jobReturn[entry]}}
                    </b-card-body>
                </b-card>
                <spinner v-if="!formattedData"></spinner>
            </div>
            <div v-if="!job">
                <p class="text-center">Loading job data...</p>
                <spinner></spinner>
            </div>
            </b-col>
        </b-row>
        <b-row class="text-center" v-if="!state.auth.status" style="padding-top:100px">
            <b-col></b-col>
            <b-col>
                <h2>You are not logged in </h2>
                <b-btn :to="{'name': 'dashboard'}">Login</b-btn>
            </b-col>
            <b-col></b-col>
        </b-row>


    </b-container>
</template>

<script>
import axios from 'axios'
import Spinner from 'components/Spinner.vue'

export default {
    name: 'JobDetail',
    props: ['jid','job'],
    components: {
        'spinner': Spinner
    },
    data() { 
        return {
            state: this.$root.sharedState.state,
            jobReturn: null
        }
    },
    methods: {
        loadData: function() {
            this.jobReturn = null
            axios.post('https://' + this.state.auth.server + 
                    ':' + this.state.auth.port + '/', {
                        client: "runner",
                        fun: "jobs.lookup_jid",
                        jid: this.jid
                    },{
                        headers: {
                            'x-auth-token': this.state.auth.token,
                            'content-type': 'application/json',
                            'accept': 'application/json'
                        }
                    })
                    .then((response) => {
                        this.jobReturn = response['data']['return'][0]
                    })
                    .catch((error) => {
                        console.debug(error)
                        return false
                    })
        },
    },
    computed: {
        formattedData: function () {
            if(this.jobReturn){
            return JSON.stringify(this.jobReturn, 2)
            }
        },
        downloadData: function() {
            if(this.jobReturn){
                return "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.jobReturn, 2))
            }
        }
    },
    created() {
        this.loadData()
    }
}
</script>
<template>
    <b-card class="job-card">
        <b-row>
            <b-col cols="10">
                    <strong>{{ job.properties.Function }}</strong> on {{ job.properties.Target }} by <i class="fa fa-user"></i> {{ job.properties.User }}
                    <p class="small text-secondary">
                        {{ job.properties.StartTime }} <br>
                    </p>
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
    name: 'job-item',
    props: ['job'],
    data() {
        return {
            state: this.$root.sharedState.state,
            apiTime: Date.now()
        }
    },
    methods: {
    }
}
</script>

<style scoped>
    .job-card p {
        margin:0;
        padding:0;
    }
</style>
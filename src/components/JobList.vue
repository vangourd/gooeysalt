<template>
    <b-col>
        <h2 class="text-center">Job List</h2>
            <job-item v-for="(job, index) in jobs" :job="job" :jid="jobs[index]" :key="index">
            </job-item>
    </b-col>
</template>

<script>
import axios from 'axios';
import JobItem from './JobItem.vue';

export default {

    name: 'joblist',
    props: ['jobs'],
    components: {
        'job-item': JobItem,
    },
    methods: {
        loadJobs: function() {
                console.debug("Server" + this.state.auth.server)
                console.debug("Port" + this.state.auth.port)
                axios.get('https://' + this.state.auth.server + 
                    ':' + this.state.auth.port + '/jobs', {
                    headers: {'x-auth-token': this.state.auth.token}
                          })
                     .then((response) => this.jobs = response.data.return[0] )
                     .catch((error) => {
                        console.error(error)
                    })
            },
    },
    data() {
        return {
            state: this.$root.sharedState.state,
            timer: '',
        }
    },
    created() {
        this.loadJobs()
        this.timer = setInterval(this.loadJobs, 10000)
    },
    beforeDestroy() {
        clearInterval(this.timer)
    }
}

</script>

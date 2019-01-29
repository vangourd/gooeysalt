<template>
    <div>
        <b-btn class="collapsebutton" 
               v-b-toggle.collapseCreateJob
               @click="resetStatus"
               variant="light">
            <i class="fa fa-plus"></i>
        </b-btn>
        <b-collapse id="collapseCreateJob">
            <strong>Create new job</strong><br>
            <a target="_blank" href="https://docs.saltstack.com/en/latest/topics/execution/remote_execution.html">Tutorial </a> <br> 
            <a target="_blank" href="https://docs.saltstack.com/en/latest/ref/modules/all/">Command Reference</a>
            <b-form-group>
                <b-form-input v-model="jobInput" placeholder="Enter your command here"></b-form-input>
                <b-form-text v-if="stagedJob.data.client">Type: {{ stagedJob.data.client}}</b-form-text>
                <b-form-text>Target: {{ stagedJob.data.tgt }}</b-form-text>
                <b-form-text>Function: {{ stagedJob.data.fun }}</b-form-text>
                <b-form-text v-if="stagedJob.data.arg">Arguments: {{ stagedJob.data.arg }}</b-form-text>
                <b-btn :variant="jobStatus.variant" @click="submitJob">{{ jobStatus.text }}</b-btn>
            </b-form-group>
        </b-collapse>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'jobcreator',
    data() { 
        return {
            jobInput: '',
            jobStatus: {'text':'Submit','variant':'secondary'},
            state: this.$root.sharedState.state,
        }
    },
    computed: {
        stagedJob: function() {
            if(!this.jobInput){return {data:{
                'client': null,
                'tgt': null,
                'fun': null,
                'arg': null,

            }}}
            try {
                var data = {}
                var command = this.jobInput.split(' ')
                if (command[0].match(/-/)){
                    if(command[0] == '-G') { data.client = 'grains'}
                    if(command[0] == '-C') { data.client = 'compound'}
                    command.shift()
                }
                else {
                    data.client = 'local_async'
                }
                if (command.length > 2){
                    data.arg = command.splice(2)
                }
                data.tgt = command[0] || null,
                data.fun = command[1] || null
                return {
                    data
                }

            }
            catch(err){
                console.debug(err)
            }
        },
    },
    methods: {
        submitJob: function() {
            var data = this.stagedJob.data
            if(! (
                data.client && data.tgt && data.fun
            )){this.jobStatus.text = "Missing information";this.jobStatus.variant = "warning"; return}
            this.jobStatus.text = "Sending job..."
            this.jobStatus.variant = "primary"
            axios.post('https://' + this.state.auth.server + 
                    ':' + this.state.auth.port + '/', data,{
                    headers: {
                        'x-auth-token': this.state.auth.token,
                        'content-type': 'application/json',
                        'accept': 'application/json'
                    }
                            })
                    .then((response) => {
                        this.jobStatus.text = "Job Submitted"
                        this.jobStatus.variant = 'success'
                        this.$emit('submitted',response.data.return[0].jid)
                    })
                    .catch((err) => {
                        console.debug(err)
                    })
                },
            resetStatus: function() {
                this.jobStatus.text = 'Submit'
                this.jobStatus.variant = 'secondary'
                this.jobInput = null
            }
        }
    }

</script>

<style scoped>
.collapsebutton {
    width:100%;
    border-radius:0;
}
#collapseCreateJob {
    padding:20px;
}
</style>
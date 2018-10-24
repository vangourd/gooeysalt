<template>
    <div>
        <b-btn class="collapsebutton" 
               v-b-toggle.collapseCreateJob
               variant="light">
            <i class="fa fa-plus"></i>
        </b-btn>
        <b-collapse id="collapseCreateJob">
            <strong>Create new job</strong>
            <b-form-group>
                <b-form-input v-model="jobInput" placeholder="Enter your command here"></b-form-input>
                <b-form-text v-if="stagedJob['targetType']">Type: {{ stagedJob['targetType'] }}</b-form-text>
                <b-form-text>Target: {{ stagedJob['jobTarget'] }}</b-form-text>
                <b-form-text>Function: {{ stagedJob['jobFunction'] }}</b-form-text>
                <b-form-text v-if="stagedJob['jobArguments']">Arguments: {{ stagedJob['jobArguments'] }}</b-form-text>
                <b-btn @click="submitJob">Submit</b-btn>
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
            jobInput: ''
        }
    },
    computed: {
        stagedJob: function() {
            try {
                var retdata = {}
                var command = this.jobInput.split(' ')
                if (command[0].match(/-/)){
                    if(command[0] == '-G') { retdata['targetType'] = 'grains'}
                    if (command[0] == '-C') { retdata['targetType'] = 'compound'}
                    command.shift()
                }
                retdata['jobTarget'] = command[0]
                retdata['jobFunction'] = command[1]
                if (command.length > 2){
                    retdata['jobArguments'] = command.splice(2)
                }
                else {
                    retdata['jobArguments'] = false
                }
                return {
                    'targetType': retdata.targetType,
                    'jobTarget': retdata.jobTarget,
                    'jobFunction': retdata.jobFunction,
                    'jobArguments': retdata.jobArguments
                }
            }
            catch(err){
                console.debug(err)
            }

        },
    },
    methods: {
        submitJob: function() {
            if (this.stagedJob.jobTarget && 
                this.stagedJob.jobFunction) {
                    console.debug(this.stagedJob)
                    this.jobInput = ''

            }
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
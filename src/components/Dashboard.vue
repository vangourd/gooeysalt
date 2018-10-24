<template>
    <b-container id="container" fluid>
        <actionbar></actionbar>
        
        <b-row id="workarea">
                <joblist v-if="state.current_view === 'jobs' "></joblist>
                <minionlist v-if="state.current_view === 'minions' "></minionlist>
                <reports v-if="state.current_view === 'reports' "></reports>
                </b-col>
        </b-row>
    </b-container>
</template>

<script>
import StatusBar from './StatusBar.vue'
import JobList from './JobList.vue'
import ActionBar from './ActionBar.vue'
import MinionList from './MinionList.vue'
import Reports from './Reports.vue'

    export default {
        name: 'dashboard',
        props:['jobs'],
        components: {
            'joblist' : JobList,
            'minionlist': MinionList,
            'reports': Reports,
            'actionbar': ActionBar 
        },
        data() {
            return {
               state: this.$root.sharedState.state,
               response: '',
            }
        },
        created() { 
            console.debug('Dashboard component created')
            this.$root.sharedState.initAuth()
            
        },
    };
</script>

<style scoped>
#workarea {
    overflow: hidden;
    transition: margin-left .5s;
    margin-left: 20px;
}

</style>     


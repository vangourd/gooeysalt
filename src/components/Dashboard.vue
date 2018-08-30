<template>
    <div>
        <actionbar></actionbar>
        
        <div id="workarea">
            <b-row>
                <joblist v-if="state.current_view === 'jobs' "></joblist>
                <minionlist v-if="state.current_view === 'minions' "></minionlist>
                <cli v-if="state.current_view === 'cli' "></cli>
                <reports v-if="state.current_view === 'reports' "></reports>
            </b-row>
        </div>
    </div>
</template>

<script>
import StatusBar from './StatusBar.vue'
import JobList from './JobList.vue'
import ActionBar from './ActionBar.vue'
import MinionList from './MinionList.vue'
import Reports from './Reports.vue'
import Cli from './Cli.vue'

    export default {
        name: 'dashboard',
        props:['jobs'],
        components: {
            'joblist' : JobList,
            'minionlist': MinionList,
            'cli': Cli,
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
    margin-left: 50px;
}

</style>     


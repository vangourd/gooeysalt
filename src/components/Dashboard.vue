<template>
    <div>
        <statusbar></statusbar>
        <b-row id="workarea">
            <action-bar></action-bar>
            <joblist></joblist>
        </b-row>
    </div>
</template>

<script>
import StatusBar from './StatusBar.vue'
import JobList from './JobList.vue'
import ActionBar from './ActionBar.vue'

    export default {
        name: 'dashboard',
        props:['jobs'],
        components: {
            'statusbar' : StatusBar,
            'joblist' : JobList,
            'ActionBar': ActionBar 
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
}

</style>     


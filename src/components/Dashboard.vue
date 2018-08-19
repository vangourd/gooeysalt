<template>
    <div>
        <statusbar></statusbar>
        <b-row>
            <joblist></joblist>
        </b-row>
    </div>
</template>

<script>
import StatusBar from './StatusBar.vue'
import JobList from './JobList.vue'

    export default {
        name: 'dashboard',
        props:['jobs'],
        components: {
            'statusbar' : StatusBar,
            'joblist' : JobList
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
</style>     


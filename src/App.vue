<template>
  <router-view id="app"></router-view>
</template>

<script>
export default { 
  name: 'app',
  updated() {
    if(this.auth.authorized){
      if(this.$store.getters.minions_length === 0){ this.$store.dispatch('loadMinions') }
      if(this.$store.getters.jobs_length === 0){
        this.$store.dispatch('getJobsIn5Minutes')
        this.$store.dispatch('getActiveJobs')
      }
    }
    if(!this.auth.authorized){
      this.$store.dispatch('checkAuthfromStorage')
    }
  },
  computed: {
    auth: function() {
      return this.$store.state.auth
    },
  },
}
</script>

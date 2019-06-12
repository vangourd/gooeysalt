<template>
  <router-view id="app"></router-view>
</template>

<script>
export default { 
  name: 'app',
  created() {
    if(!this.auth.authorized){
      if(this.$store.dispatch('loadAuthFromStorage')){
        this.$store.dispatch('loadMinions')
        this.$store.dispatch('getJobsIn5Minutes')
        this.$store.dispatch('getActiveJobs')
      }
    }
  },
  updated() {
    if(this.auth.authorized){
      
    }
  },
  computed: {
    auth: function() {
      return this.$store.state.auth
    },
  },
}
</script>

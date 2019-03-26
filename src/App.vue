<template>
  <router-view id="app"></router-view>
</template>

<script>
export default { 
  name: 'app',
  created() {
    if(!this.auth.authorized){
      let local = JSON.parse(localStorage.getItem('auth'))
      if(local.authorized === true){
        this.$store.commit('loadAuthFromStorage', local)
      }
    }
  },
  computed: {
    auth: function() {
      return this.$store.state.auth
    }
  }
}
</script>

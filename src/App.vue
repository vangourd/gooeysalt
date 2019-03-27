<template>
  <router-view id="app"></router-view>
</template>

<script>
export default { 
  name: 'app',
  created() {
    if(!this.auth.authorized){
      this.$store.dispatch('checkAuthfromStorage')
    }
  },
  computed: {
    auth: function() {
      return this.$store.state.auth
    }
  },
}
</script>

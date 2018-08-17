<template>
  <router-view id="app"></router-view>
</template>

<script>
export default { 
  name: 'app',
  data: {
    sharedState: this.sharedState
  }
}
</script>

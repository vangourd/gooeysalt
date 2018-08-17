<template>
    <div class="dashboard">
        <statusbar></statusbar>
    </div>
</template>

<script>
import StatusBar from './StatusBar.vue'

    export default {
        name: 'dashboard',
        components: {
            'statusbar' : StatusBar
        },
        data() {
            return {
                sharedState: this.$root.sharedState
            }
        },
    };
</script>

<style scoped>
</style>     


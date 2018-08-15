<template>
    <div class="dashboard">
        <statusbar :connectionData="connectionData"></statusbar>
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
                connectionData: {
                    status: 'Connect to salt server',
                    variant: 'secondary',
                    address: null,
                    username: null,
                    password: null,
                    eauth: 'auto',
                    token: null,
                    perms: null,
                    expire: null,
                }
            }
        },
    };
</script>

<style scoped>
</style>     


<template>
<b-col>
    <h2>Minions</h2>
    <spinner v-if="!minions"></spinner>
</b-col>

</template>

<script>
import Spinner from './Spinner.vue'

export default {
    name: 'minionlist',
    components: {
        'spinner': Spinner
    },
    methods: {
        loadMinions: function() {
                if(this.state.auth.status == true){ 
                axios.post('https://' + this.state.auth.server + 
                    ':' + this.state.auth.port + '/', {
                        client: "local",
                        tgt: '*',
                        fun: "grains.items",
                    },{
                    headers: {
                        'x-auth-token': this.state.auth.token,
                        'content-type': 'application/json',
                        'accept': 'application/json'
                    }
                          })
                     .then((response) => this.jobs = response.data.return[0] )
                     .catch((error) => {
                        console.error(error)
                    })
                }
            },
    },
    data: {
        minions: null
    },
    created() {
        this.loadMinions()
        this.timer = setInterval(this.loadMinions, 10000)
    }
}
</script>
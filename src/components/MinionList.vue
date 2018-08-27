<template>
<b-col>
    <h2>Minions</h2>
    <div v-if="minions" v-for="minion in minions" :key="minion">
        <b-card>{{ minion }}</b-card>
    </div>
    <spinner v-if="!minions"></spinner>
</b-col>

</template>

<script>
import axios from 'axios'
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
                        client: "local_async",
                        tgt: "*",
                        fun: "test.arg",
                        arg: "test"
                    },{
                    headers: {
                        'x-auth-token': this.state.auth.token,
                        'content-type': 'application/json',
                        'accept': 'application/json'
                    }
                          })
                     .then((response) => {
                         this.jid = response['data']['return'][0].jid
                         this.minions = response['data']['return'][0].minions
                         localStorage.setItem('minions', JSON.stringify(response['data']['return'][0].minions))
                         } )
                     .catch((error) => {
                        console.error(error)
                    })
                }
            },
        initView: function() {
            console.debug('initView started')
            if(localStorage.getItem('minions')){
                console.debug('loading local storage')
                this.minions = JSON.parse(localStorage.getItem('minions'))
            }
        }
    },
    data() {
        return {
           state: this.$root.sharedState.state,
           minions: null,
           jid: null
        }
    },
    created() {
        this.initView()
        this.loadMinions()
        this.timer = setInterval(this.loadMinions, 50000)
    }
}
</script>
<template>
<b-col>
    <h2>Minions</h2>
    <div v-if="minions" v-for="(value, key) in minions" :key="value.id">
        <b-card v-if="value">
            <i class="fab" :class="{ 'fa-windows large' : (value.kernel == 'Windows') }"></i>
            <i class="fab" :class="{ 'fa-linux large' : (value.kernel == 'Linux') }"></i>
            <strong>{{key}}</strong>
        </b-card>
        <b-card v-if="!value">
            <i class="fa fa-bed"></i>
            <strong>{{ key }}</strong>
        </b-card>
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
                        client: "local",
                        tgt: "*",
                        fun: "grains.items"
                    },{
                    headers: {
                        'x-auth-token': this.state.auth.token,
                        'content-type': 'application/json',
                        'accept': 'application/json'
                    }
                          })
                     .then((response) => {
                         console.debug("Processing minions response")
                         if(response) {
                            this.minions = response['data']['return'][0]
                            localStorage.setItem('minions', JSON.stringify(response['data']['return'][0]))
                         }
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
           jid: null,
        }
    },
    created() {
        this.initView()
        this.loadMinions()
        this.timer = setInterval(this.loadMinions, 50000)
    }
}
</script>
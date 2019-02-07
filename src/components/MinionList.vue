<template>
<b-col id="minionlist">
    <b-navbar toggleable="md" type="dark" variant="dark">
        <b-navbar-toggle target="minions_collapse"></b-navbar-toggle>
        <b-navbar-brand class="fa fa-cubes"> Minions</b-navbar-brand>
        <b-collapse is-nav id="minions_collapse">
        <b-navbar-nav>
            <b-nav-text> Sort by:</b-nav-text>
            <b-nav-item @click="sortByName()">
                <i class="fa" :class="{
                    'fa-sort-up': this.actionBar.sort == 'nameUp',
                    'fa-sort-down': this.actionBar.sort == 'nameDown',
                    'fa-server': !this.actionBar.sort.includes('name')
                }"> Name</i>
            </b-nav-item>
            <b-nav-item @click="sortByResponse()">
                <i class="fa" :class="{
                    'fa-sort-up':this.actionBar.sort == 'responseUp',
                    'fa-sort-down':this.actionBar.sort == 'responseDown',
                    'fa-heartbeat': !this.actionBar.sort.includes('response')
                }"> Response</i>
            </b-nav-item>
            <b-nav-item><i class="fa fa-check"></i> State</b-nav-item>
            <b-nav-item @click="sortByOS()">
                <i :class="{
                    'fa fa-sort-up':this.actionBar.sort == 'osUp',
                    'fa fa-sort-down':this.actionBar.sort == 'osDown',
                    'fab fa-windows': !this.actionBar.sort.includes('os')
                }"> OS</i>
            </b-nav-item>`
            <b-nav-item @click="loadMinionsFromServer" right>
                <i class="fa fa-sync-alt"> Refresh</i>
            </b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
                    <b-nav-form class="searchcontainer">
                        <b-form-input
                            placeholder="Search">
                        </b-form-input>
                    </b-nav-form>
        </b-navbar-nav>
        </b-collapse>
    </b-navbar>
        <div class="listView" v-for="minion in minions.data" :key="minion.name">
                <b-card class="minionCard" v-if="minion.properties">
                            <!-- Name and OS Type -->
                    <i class="fa fa-circle statusindicator" v-if="minion.status == 'up'" ></i>
                    <i class="fa fa-bed" v-if="minion.status == 'down '"></i>
                    <i class="fab" :class="{ 'fa-windows large' : (minion.properties.kernel == 'Windows') }"></i>
                    <i class="fab" :class="{ 'fa-linux large' : (minion.properties.kernel == 'Linux') }"></i>
                        <strong>{{ minion.properties.fqdn }}</strong>
                    <b-badge v-for="(role, index) in minion.properties.roles" :key="index">{{ role }}</b-badge>
                </b-card>
        </div>
    <spinner v-if="minions.length == 0"></spinner>
</b-col>

</template>

<script>
import axios from 'axios'
import Spinner from './Spinner.vue'
import SaltMinions from '../SaltMinions.js'

export default {
    name: 'minionlist',
    components: {
        'spinner': Spinner
    },
    data() {
        return {
           state: this.$root.sharedState.state,
           minions: [],
           actionBar: {
               'sort': 'nameSortDown'
           },
           minions: false,
           setupInterval: false,
           apilimit: Date.now(),
           slideposition: 12,
           currentminion: "Test"
        }
    },
    created() {
        this.setupInterval = setInterval(this.setupClients, 2000)
    },
    methods: {

        setupClients: function() {
            if(this.connectedToApi()){
                clearInterval(this.setupInterval)
                this.minions = new SaltMinions({
                    "auth": this.state.auth
                })
                if(!this.loadMinionsFromStorage()) {
                    this.loadMinionsFromServer()
                }
            }
        },

        loadMinionsFromServer: function(){
            this.minions.get()
        },

        loadMinionsFromStorage: function(){
            if(localStorage.getItem('minions')){
                var minions = JSON.parse(localStorage.getItem('minions'))
                this.minions.data.length = 0
                this.minions.data.push.apply(this.minions.data,minions)
                return true
            }

            else return false
        },

        saveMinionsToStorage: function() {
            if(this.minions.data.length > 0){
                var minions = JSON.stringify(this.minions.data)
                localStorage.setItem('minions', minions)
            }
        },

        connectedToApi(){
            if(typeof(this.state.auth.status) == 'boolean')
                return this.state.auth.status
        },
        
        sortByName () {

            if(this.actionBar.sort === 'nameUp'){
                this.actionBar.sort = 'nameDown'
                this.minions.view =  this.minions.sort.nameDown(this.minions.view)
            }
            else{
                this.actionBar.sort = 'nameUp'
                this.minions.view = this.minions.sort.nameUp(this.minions.view)
            }
        },

        sortByResponse () {
            if(this.actionBar.sort === 'responseUp'){
                this.actionBar.sort = 'responseDown'
                this.minions.view = this.minions.sort.responseDown(this.minions.view)
            }
            else{
                this.actionBar.sort = 'responseUp'
                this.minions.view = this.minions.sort.responseUp(this.minions.view)
            }
        },

        sortByOS () {
            if(this.actionBar.sort === 'osUp'){
                this.actionBar.sort = 'osDown'
                this.minions.view = this.minions.sort.osDown(this.minions.view)
            }
            else{
                this.actionBar.sort = 'osUp'
                this.minions.view = this.minions.sort.osUp(this.minions.view)
            }
        }, 
        closeSlider(){
            this.slideposition = 12
        },
        changeSlider(minion) {
            this.currentminion = minion
            if (this.slideposition == 12){
                this.slideposition = 5
            }
        }
    },
    beforeDestroy() {
        this.saveMinionsToStorage()
        clearInterval(this.timer)
    },
}
</script>

<style>
#minionlist {
    padding-right:0px
}
.statusindicator {
    color:green;
}
.listView {
    -webkit-transition: all 0.6s ease-in-out;
    -moz-transition: all 0.6s ease-in-out;
    -o-transition: all 0.6s ease-in-out;
    transition: all 0.6s ease-in-out;
    cursor: pointer;
}
.minionCard:hover {
    background-color:whitesmoke;
}
</style>

<template>
<b-container fluid id="minionlist" class="mx-0 px-0">
    <b-navbar toggleable="md" type="dark" variant="dark">
        <b-navbar-toggle target="minions_collapse"></b-navbar-toggle>
        <b-navbar-brand class="fa fa-cubes" @click="$router.push({'path': 'jobs'})"> Minions</b-navbar-brand>
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
            <b-nav-item @click="refresh" right>
                <i class="fa fa-sync-alt"> Refresh</i>
            </b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
                    <b-nav-form class="searchcontainer">
                        <b-form-input
                            placeholder="Search">
                        </b-form-input>
                    </b-nav-form>
            <router-link tag="b-nav-item" to="/logout">
                <b-nav-item>
                    Logout {{ auth.username }} <i class="fa fa-user"></i>
                </b-nav-item>
            </router-link>
        </b-navbar-nav>
        
        </b-collapse>
    </b-navbar>
        <div class="listView" v-for="minion in minions" :key="minion.name">
                <b-card class="minionCard" v-if="minion.properties">
                    <i class="fa fa-circle statusindicator" v-if="minion.status == 'up'" ></i>
                    <i class="fa fa-bed" v-if="minion.status === 'down '"></i>
                    <i class="fab" :class="{ 'fa-windows large' : (minion.properties.kernel == 'Windows') }"></i>
                    <i class="fab" :class="{ 'fa-linux large' : (minion.properties.kernel == 'Linux') }"></i>
                        <strong>{{ minion.properties.fqdn }}</strong>
                    <b-badge v-for="(role, index) in minion.properties.roles" :key="index">{{ role }}</b-badge>
                </b-card>
        </div>
    <spinner v-if="this.minions === 0"></spinner>
</b-container>
</template>

<script>
import axios from 'axios'
import Spinner from 'components/Spinner.vue'

export default {
    name: 'minionlist',
    props: ['minion'],
    components: {
        'spinner': Spinner
    },
    data() {
        return {
            actionBar: {
                'sort': 'minionsNameDown'
            },
            apilimit: Date.now(),
            slideposition: 12,
        }
    },
    created() {
        if(!this.auth.authorized){
            this.$router.push('login')
        }
    },
    computed: {
        auth: function() {
            return this.$store.state.auth
        },
        minions: function() {
            return this.$store.state.minions.all
        }
    },
    // computed: {
    //     minionsNameUp: function () {
    //         return this.$store.state.minions.all.sort(function(a,b) {
    //             if(a.name < b.name) return 1;
    //             if(a.name > b.name) return -1;
    //             return 0; 
    //         })
    //     },
    //     minionsNameDown: function() {
    //         return this.$store.state.minions.all.sort(function(a,b) {
    //             if(a.name < b.name) return -1;
    //             if(a.name > b.name) return 1;
    //             return 0; 
    //         })
    //     },
    //     minionsResponseUp: function(minions){
    //         return this.$store.state.minions.all.sort(function(a,b) {
    //             if(a.properties == null) return -1;
    //             return 1;
    //         })
    //     },
    //     minionsResponseDown: function(minions){
    //         return this.$store.state.minions.all.sort(function(a,b) {
    //             if(a.properties == null) return 1;
    //             return -1;
    //         })
    //     },
    //     minionsOSUp: function(minions){
    //         return  this.$store.state.minions.all.sort(function(a,b) {
    //             if(a.properties == null || b.properties == null) return 2 
    //             if(a.properties.kernel > b.properties.kernel) return 1
    //             if(a.properties.kernel < b.properties.kernel) return -1
    //             return 0;
    //         })
    //     },
    //     minionsOSDown: function(minions){
    //         return this.$store.state.minions.all.sort(function(a,b) {
    //             if(a.properties == null || b.properties == null) return 2
    //             if(a.properties.kernel > b.properties.kernel) return -1
    //             if(a.properties.kernel < b.properties.kernel) return 1
    //             return 0;
    //         })
    //     }
    //},
    methods: {
        refresh() {
            this.minions.clearAndGet()
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

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
                    'fa fa-sort-up':this.actionBar.sort == 'OSUp',
                    'fa fa-sort-down':this.actionBar.sort == 'OSDown',
                    'fab fa-windows': !this.actionBar.sort.includes('OS')
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
            <a tag="b-nav-item" @click="logout">
                <b-nav-item>
                    Logout {{ auth.username }} <i class="fa fa-user"></i>
                </b-nav-item>
            </a>
        </b-navbar-nav>
        
        </b-collapse>
    </b-navbar>
        <div class="listView" v-for="minion in this.minions" :key="minion">
                <b-card class="minionCard">
                    <div v-if="status[minion] === 'down'">
                        <i class="fa fa-bed"></i>
                        <strong> {{ minion }} </strong>
                    </div>
                    <div v-if="status[minion] === 'up'">
                        <div v-if="properties[minion] === null">
                            <i class="fa fa-spinner fa-pulse"></i>
                            <strong> {{ minion }} </strong>
                        </div>
                        <div v-if="properties[minion] !== null">
                            <i class="fa fa-circle statusindicator"></i>
                            <i class="fab" :class="{ 'fa-windows large' : (properties[minion].kernel == 'Windows') }"></i>
                            <i class="fab" :class="{ 'fa-linux large' : (properties[minion].kernel == 'Linux') }"></i>
                            <strong>{{ properties[minion].fqdn }}</strong>
                            <b-badge v-for="(role, index) in properties[minion].roles" :key="index">{{ role }}</b-badge>
                        </div>
                    </div>
                </b-card>
        </div>
    <spinner v-if="this.$store.state.minions.waiting"></spinner>
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
                'sort': 'nameUp'
            },
            apilimit: Date.now(),
            slideposition: 12,
        }
    },
    created() {
    },
    computed: {
        auth: function() {
            return this.$store.state.auth
        },
        minions: function() {
            return this.$store.getters.minions[this.actionBar.sort]
        },
        properties: function() {
            return this.$store.state.minions.properties
        },
        status: function() {
            return this.$store.state.minions.status
        }
    },
    methods: {
        refresh() {
            this.minions.clearAndGet()
        },
        sortByName () {

            if(this.actionBar.sort === 'nameUp'){
                this.actionBar.sort = 'nameDown'
            }
            else{
                this.actionBar.sort = 'nameUp'
            }
        },

        sortByResponse () {
            if(this.actionBar.sort === 'responseUp'){
                this.actionBar.sort = 'responseDown'
            }
            else{
                this.actionBar.sort = 'responseUp'
            }
        },

        sortByOS () {
            if(this.actionBar.sort === 'OSUp'){
                this.actionBar.sort = 'OSDown'
            }
            else{
                this.actionBar.sort = 'OSUp'
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
        },
        logout(){
            this.$store.dispatch('logout')
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

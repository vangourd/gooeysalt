<template>
    <b-container fluid class="mx-0 px-0">
        <b-navbar toggleable="md" type="dark" variant="dark">
            <b-navbar-toggle target="minions_collapse"></b-navbar-toggle>
            <b-navbar-brand class="fa fa-cube"> Gooeysalt</b-navbar-brand>
        </b-navbar>
        <b-row id="loginform">
            <b-col cols="4" class="mx-auto mt-5">
                <b-form-group>
                <b-input placeholder="Username" v-model="username" ></b-input>
                <b-input placeholder="Password" v-model="password" type="password"></b-input>
                <div v-show="settingsOpen">
                    <label>Server Address</label>
                    <b-input id="server_field" v-model="server"></b-input>
                    <label>Server Port</label>
                    <b-input id="port_field" v-model="port"></b-input>
                    <b-form-select  :options="eauthOptions" 
                                    v-model="eauth"
                                    id="eauth_field"
                                    placeholder="EAuthentication Type">
                    </b-form-select>
                    <b-btn ref="ping" :variant="ping.variant" 
                            @click="pingTest"
                            class="mt-2 mb-2">
                            {{ ping.text }}
                    </b-btn>
                </div>
                <b-btn id="loginbtn" @click="authenticate">Login <i v-show="auth.waiting == true" class="fa fa-spinner"></i></b-btn>
                </b-form-group>
            </b-col>
        </b-row>
        
        <div class="settings text-center" @click="toggleSettings">
           ----- Advanced settings -----
        </div>
    </b-container>
</template>

<script>
import axios from 'axios'

export default {
    name: 'login',
    created(){
        if(this.auth.authorized){
            this.$router.push('minions')
        }
        if(window.AUTH_CONFIG){
            this.server = AUTH_CONFIG.server
            this.port = AUTH_CONFIG.port
            this.eauth = AUTH_CONFIG.eauth
        }
    },
    data() {
        return{
            settingsOpen: false,
            username: '',
            password: '',
            server: 'salt',
            port: '8000',
            eauth: 'auto',
            eauthOptions: [
                {text:'Auto', value: 'auto'},
                {text:'Pam', value: 'pam'},
                {text:'Ldap', value: 'ldap'},
            ],
            ping: {
                'variant': 'secondary',
                'text': 'Test'
            }
        }
    },
    computed: {
        auth() {
            return this.$store.state.auth
        },
    },
    methods: {
        toggleSettings: function() {
            this.settingsOpen = !this.settingsOpen
        },
        pingTest: function() {
            this.$store.dispatch('serverPing',{'server':this.server,'port':this.port})
            .then((response) => {
                if(response){
                    this.ping.variant = 'success'
                    this.ping.text = 'Success'
                }
                else {
                    this.ping.variant = 'danger'
                    this.ping.text = 'Failed'
                }
            })
            .catch((error) => {
                console.debug(error)
                this.ping.variant = 'danger'
                this.ping.text = 'Failed'
            })
            
        },
        authenticate: function() {
            return axios.post('https://' + this.server + 
                            ':' + this.port + '/login', {
                    username: this.username,
                    password: this.password,
                    eauth: this.eauth
                })
            .then((response) => {
                if(response.status == 200){
                    console.debug(response)
                    let data = response['data']['return'][0]
                    this.$store.commit('sessionUpdate', {
                        username: this.username,
                        eauth: this.eauth,
                        token: data.token,
                        expire: data.expire,
                        perms: data.perms
                    })
                    this.$store.dispatch('serverHeartBeat')
                    this.$router.push('minions')
                }
            })
        },
    },
}
</script>

<style scoped>
#loginform input {
    margin-bottom: 10px;
}
.settings{
    color:gray;
    cursor:pointer;
}
.settings:hover{
    color:black;
}

</style>
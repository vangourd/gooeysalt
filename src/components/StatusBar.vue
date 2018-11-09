<template>
<div>
        <b-btn :variant="state.auth.variant" v-b-modal.connectionModal>
            {{ state.auth.short_message }}
        </b-btn>
        <b-modal id="connectionModal" title="Login" v-model="modalShow">
            <b-badge :variant="state.auth.variant">
                 {{ state.auth.message }}
            </b-badge>
            <b-form-group>
                    <b-input-group>
                    <b-input-group-text slot="prepend">
                        <strong>https://</strong>
                    </b-input-group-text>
                    <b-form-input
                            v-model="state.auth.server" 
                        placeholder="Address" >
                    </b-form-input>
                    <b-form-input v-model="state.auth.port" 
                        placeholder="Port" >
                    </b-form-input>
                        <b-btn @click="checkConnection" :variant="connection_test.variant" slot="append">
                        <strong>Test</strong>
                    </b-btn>
                </b-input-group>
                <b-form-input v-model="state.auth.username" placeholder="Username"></b-form-input>
                <b-form-input type="password" v-model="password" placeholder="Password"></b-form-input>
                <b-form-select v-model="state.auth.eauth" :options="options" placeholder="EAuthentication Type"></b-form-select>
                <b-btn @click="saltApiLogin" :variant="connectButton.variant">{{ connectButton.text }}</b-btn>
                <b-btn @click="clearData()" variant="danger">Clear local data</b-btn>
            </b-form-group>
        </b-modal>
        <!--TODO: Hide this when disconnected-->
        <!-- TODO: Populate this with a regular query and on startup -->
</div>
</template>
<script>
import axios from 'axios'

    export default {
        name: 'StatusBar',
        methods: {
            checkConnection: function() {
                axios.get('https://' + this.state.auth.server + 
                            ':' + this.state.auth.port + '/')
                .then((response) => {
                    this.response = response;
                    if(this.response.status == 200){
                        this.connection_test.variant = 'success'
                    }
                    else{
                        this.connection_test.variant = 'danger' 
                    }
                })
                .catch((error) => {
                    this.connection_test.variant = 'danger'
                    console.error(error)
                })

            },
            saltApiLogin: function() {
                // If connected then disconnect
                if(this.state.auth.status == true) {
                    console.debug('Logging out ' + this.state.auth.username)
                    axios.post('https://' + this.state.auth.server + 
                                 ':' + this.state.auth.port + '/logout', {},{
                        headers: {
                            'x-auth-token': this.state.auth.token,
                            'content-type': 'application/json',
                            'accept': 'application/json'
                        }
                    })
                      .then((response) => {
                          if(response.status == 200) {
                              console.debug('Log out confirmed')
                              this.$root.sharedState.clearAuth()
                              this.password = null
                          }
                      } )
                      .catch((error) => {
                        if(error.response.status == '401'){
                            console.debug('User not authorized to logout')
                            this.$root.sharedState.clearAuth()
                            this.password = null
                        }
                        console.error(error)
                     })
                 }
                // If disconnected then connect
                if(this.state.auth.status == false) {
                    console.debug('Logging into: ' + this.state.auth.server + this.state.auth.port)
                    axios.post('https://' + this.state.auth.server + 
                                ':' + this.state.auth.port + '/login', {
                        username: this.state.auth.username,
                        password: this.password,
                        eauth: this.state.auth.eauth
                    })
                    .then((response) => {
                        console.debug("response received")
                        this.response = response.data.return[0]
                        this.$root.sharedState.setAuth(
                        this.response.token,
                        this.response.user,
                        this.response.expire,
                        this.response.perms,
                        this.modalShow = false
                        )
                    })
                    .catch(error => {
                        console.error(error)
                    });
                }
            },
            clearData: function() {
                localStorage.clear();
            }
        },
        data() {
            return {
                options: [
                    { value: 'auto', text: 'Auto'},
                    { value: 'pam', text: 'Pam'},
                    { value: 'ldap', text: 'Active directory'}
                ],
                connection_test: {
                    variant: 'secondary',
                    ping: true,
                },
                response: null,
                password: null,
                state: this.$root.sharedState.state,
                modalShow: true,
            }
        },
        computed: {
            connectButton: function() {
                if(this.state.auth.status == true){
                    return {'variant':'dark','text':'Disconnect'}
                }
                else {
                    return {'variant':'primary','text':'Connect'}
                }
            }
        },
        created() {
            if (this.state.auth.status == true){
                this.modalShow=false
            }
        }
    };
</script>

<style scoped>
    .input-group, input {
        margin-bottom:20px
    }
   
</style>
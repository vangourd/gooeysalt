<template>
    <b-card bg-variant="light" class="connection">
        <b-btn :variant="state.auth.variant" v-b-toggle.statuscollapse>
            {{ state.auth.message }}
        </b-btn>
        <b-collapse id="statuscollapse">
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
                <b-btn @click="saltApiLogin">Connect</b-btn>
            </b-form-group>
        </b-collapse>
        <!--TODO: Hide this when disconnected-->
        <!-- TODO: Populate this with a regular query and on startup -->
        <b-badge>Last Highstate: {{ (new Date()).toGMTString() }}</b-badge>
        <b-badge>Coverage: 87%</b-badge>
        <b-badge>State Failures: 12</b-badge>
    </b-card>
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
                    this.response.perms
                    )
                })
                .catch(error => {
                    console.error(error)
                });
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
            }
        },
    };
</script>

<style scoped>
    .input-group, input {
        margin-bottom:20px
    }
   
</style>
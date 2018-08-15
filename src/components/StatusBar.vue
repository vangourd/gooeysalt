<template>
    <b-card bg-variant="light" class="connection">
        <b-btn :variant="connectionData.variant" v-b-toggle.statuscollapse> 
            {{ connectionData.status }}
        </b-btn>
            <b-collapse id="statuscollapse">
                <b-form-group>
                    <b-form-input @change="checkConnection" :state="testserver" v-model="connectionData.address" placeholder="Server Address"></b-form-input>
                    <b-form-input v-model="connectionData.username" placeholder="Username"></b-form-input>
                    <b-form-input type="password" v-model="connectionData.password" placeholder="Password"></b-form-input>
                    <b-form-select v-model="connectionData.eauth" :options="options" placeholder="EAuthentication Type"></b-form-select>
                    <b-btn @click="saltApiLogin">Connect</b-btn>
                </b-form-group>
            </b-collapse>
    </b-card>
</template>
<script>
import axios from 'axios'

    export default {
        name: 'StatusBar',
        props: ['connectionData'],
        methods: {
            checkConnection: function() {
                axios.get('https://' + this.connectionData.address + '/login')
                .then((response) => {
                    this.response = response;
                    if(this.response.status == 200){
                        this.testserver = true
                    }
                    else{
                        this.status = false
                    }
                })
                .catch((error) => {
                    this.testserver = false
                    console.log(error)
                })

            },
            saltApiLogin: function() {
                axios.post('https://' + this.connectionData.address + '/login', {
                    username: this.connectionData.username,
                    password: this.connectionData.password,
                    eauth: this.connectionData.eauth
                })
                .then((response) => {
                    this.connectionData.status = "Connected to " +
                                                this.connectionData.address +
                                                " as user " + this.connectionData.username
                    this.connectionData.variant = 'success'
                    this.connectionData.token = response.data.return[0].token
                    this.connectionData.username = response.data.return[0].user
                    this.connectionData.expire = response.data.return[0].expire
                    this.connectionData.perms = response.data.return[0].perms
                })
                .catch(error => {
                    console.log(error.response)
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
                testserver: null,
                response: null
            }
        },
    };
</script>

<style scoped>
   
</style>
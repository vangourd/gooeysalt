<template>
    <b-container fluid class="mx-0 px-0">
        <b-navbar toggleable="md" type="dark" variant="dark">
            <b-navbar-toggle target="minions_collapse"></b-navbar-toggle>
            <b-navbar-brand class="fa fa-cube"> Gooeysalt</b-navbar-brand>
        </b-navbar>
        <b-row id="loginform">
            <b-col cols="4" class="mx-auto mt-5">
                <b-form-group>
                <b-input placeholder="Username" v-model="auth.username"></b-input>
                <b-input placeholder="Password" v-model="password" type="password"></b-input>
                <div v-show="settingsOpen">
                    <label>Server Address</label>
                    <b-input v-model="auth.server"></b-input>
                    <label>Server Port</label>
                    <b-input v-model="auth.port"></b-input>
                    <b-form-select  :options="eauthOptions" 
                                    v-model="auth.eauth"
                                    placeholder="EAuthentication Type">
                    </b-form-select>
                    <b-btn  :variant="testUI.variant" 
                            @click="serverPing"
                            class="mt-2 mb-2">
                            {{ testUI.text }}
                    </b-btn>
                </div>
                <b-btn @click="login">Login <i v-show="auth.waiting == true" class="fa fa-spinner"></i></b-btn>
                </b-form-group>
            </b-col>
        </b-row>
        
        <div class="settings text-center" @click="toggleSettings">
           ----- Advanced settings -----
        </div>
    </b-container>
</template>

<script>
export default {
    name: 'login',
    data() {
        return{
            auth: this.$root.auth,
            settingsOpen: false,
            username: '',
            password: '',
            testUI: {
                'variant': 'secondary',
                'text': 'Test'
            },
            eauthChoice: 0,
            eauthOptions: [
                {text:'Auto', value: 'auto'},
                {text:'Pam', value: 'pam'},
                {text:'Ldap', value: 'ldap'},
            ]
        }
    },
    methods: {
        toggleSettings: function() {
            this.settingsOpen = !this.settingsOpen
        },
        serverPing: function() {
            var success = (response) => {
                this.testUI.variant = "success",
                this.testUI.text = "Success"
            }
            var failure = () => {
                this.testUI.variant = "danger",
                this.testUI.text = "Failed"
            }
            this.auth.serverPing(this.auth.server,this.auth.port,success,failure)
        },
        login: function() {

            var loginCallback = () => {
                this.$router.push({path: '/'})
            }

            if(this.auth.username && this.password){
                this.auth.login(this.password,loginCallback)
            }
        }
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
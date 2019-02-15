<template>
    <b-container fluid class="mx-0 px-0">
        <b-navbar id="statesActionBar" toggleable="sm" type="dark" variant="dark">
            <b-navbar-toggle target="states_collapse"></b-navbar-toggle>
            <b-navbar-brand @click="$router.push({'path': 'minions'})" class="fa fa-check-circle"> States</b-navbar-brand>
            <b-collapse is-nav id="states">
            <b-navbar-nav class="ml-auto">
                    <b-nav-form class="searchcontainer">
                        <b-form-input
                            
                            type="text" 
                            placeholder="Search states">
                        </b-form-input>
                    </b-nav-form>
            </b-navbar-nav>
            </b-collapse>
            <!-- Filters Modal Menu -->
        </b-navbar>
    </b-container>
</template>

<script>
export default {
    name: 'states',
    data() {
        return {
            salt: this.$root.salt
        }
    },
    created(){
        if (this.salt && this.salt.auth.status === false){
            this.$router.push({'path':'/login'})
        }
    }
}

</script>
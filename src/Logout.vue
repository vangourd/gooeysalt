<script>
export default {
    name: 'logout',
    data() { 
        return {
            
        }
    },
    methods: {
        logout: function() {
            
        }
    },
    created() {
        this.logout()
        this.$router.push({'path':'/login'})
    }
}
</script>
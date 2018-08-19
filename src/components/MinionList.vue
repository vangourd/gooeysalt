<template>

</template>

<script>

export default {
    name: 'minionlist',
    data() {
        return {
        state: this.$root.sharedState,
        minions: this.$root.sharedState.minions
        }
    }
}
</script>
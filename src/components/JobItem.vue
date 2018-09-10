<template>
    <b-card class="job-card">
        <strong>{{ job.properties.Function }}</strong> on {{ job.properties.Target }}
        <p class="small text-secondary">
            {{ job.properties.StartTime }} <br>

        </p>
    </b-card>
</template>

<script>

export default {
    name: 'job-item',
    props: ['job']
}
</script>

<style scoped>
    .job-card p {
        margin:0;
        padding:0;
    }
</style>
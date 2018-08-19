<template>
    <b-card>
        <strong>{{ job.Function }}</strong> on {{ job.Target }}
        <p class="small text-secondary">
            {{ job.StartTime }} <br>
            JID: <br>

        </p>
    </b-card>
</template>

<script>

export default {
    name: 'job-item',
    props: ['job']
}
</script>
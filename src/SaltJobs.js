import SaltClient from './SaltClient.js'

export default class SaltJobs extends SaltClient {
    constructor(auth){
        super(auth)
        this.sort = {
                functionUp: function(jobs){
                    jobs.sort(function(a,b) {
                        if(a.properties.Function < b.properties.Function) return 1;
                        if(a.properties.Function > b.properties.Function) return -1;
                        return 0; 
                    })
                    return jobs
                },

                functionDown: function(jobs){
                    jobs.sort(function(a,b) {
                        if(a.properties.Function > b.properties.Function) return 1;
                        if(a.properties.Function < b.properties.Function) return -1;
                        return 0; 
                    })
                    return jobs
                },

                startUp: function(jobs){
                    jobs.sort(function(a,b) {
                        if(a.properties.StartTime < b.properties.StartTime) return 1;
                        if(a.properties.StartTime > b.properties.StartTime) return -1;
                        return 0; 
                    })
                    return jobs
                },

                startDown: function(jobs){
                    jobs.sort(function(a,b) {
                        if(a.properties.StartTime > b.properties.StartTime) return 1;
                        if(a.properties.StartTime < b.properties.StartTime) return -1;
                        return 0; 
                    })
                    return jobs
                },

                targetUp: function(jobs){
                    jobs.sort(function(a,b) {
                        if(a.properties.Target < b.properties.Target) return 1;
                        if(a.properties.Target > b.properties.Target) return -1;
                        return 0; 
                    })
                    return jobs
                },

                targetDown: function(jobs){
                    jobs.sort(function(a,b) {
                        if(a.properties.Target > b.properties.Target) return 1;
                        if(a.properties.Target < b.properties.Target) return -1;
                        return 0; 
                    })
                    return jobs
                }
            }
    }
} 
<template>
    <nav :class="{styleNavOpen: navopen, styleNavClose: !navopen}" id="menu">
        <i @click="toggleNav" class="fa text-center" :class="{'fa-arrow-circle-right': !navopen,'fa-arrow-circle-left': navopen}" id="navBtn"></i>
        <statusbar v-if="navopen"></statusbar>
        <div id="viewselection">
           <div class="rotate-text" :class="{'rotate-text-open': !navopen}">
               <strong >GooeySalt</strong>
           </div>
           <b-btn @click="changeView('minions') " class="fa fa-cubes" variant="light" v-bind:block="navopen">
               <span v-if="navopen"> Minions</span>
            </b-btn>
           <b-btn @click="changeView('jobs')" class="fa fa-tasks" variant="light" v-bind:block="navopen">
                <span v-if="navopen"> Jobs</span>
           </b-btn>
           <b-btn class="fa fa-edit" variant="light" v-bind:block="navopen">
                <span v-if="navopen"> States</span>
           </b-btn> 
           <b-btn @click="changeView('reports')" class="fa fa-glasses" variant="light" v-bind:block="navopen">
                <span v-if="navopen"> Reports</span>
           </b-btn> 
        </div>
    </nav>
</template>

<script>
import slideout from 'slideout'
import StatusBar from './StatusBar.vue'

export default {
    name: 'actionbar',
    components: {
        'statusbar': StatusBar
    },
    methods: {
      toggleNav: function(){
        this.navopen = !this.navopen
      },
      changeView: function(view){
          this.state.current_view = view
      }
    },
    data() {
        return {
        state: this.$root.sharedState.state,
        navopen: false,
        selection: '',
        }
    },
    created() {
        if (this.state.auth.status == false){
            this.toggleNav()
        }
    }
}
</script>

<style scoped>
/* The side navigation menu */
#menu {
    overflow-x: hidden;
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 1;
    background-color: #597151;
    transition: 0.5s;
    padding:8px;
}

#filters span:first-child {
    color:white;
    padding-bottom:0;
}

.rotate-text{
    color:white;
}
.rotate-text-open{
    margin-top:20px;
    transform: rotate(90deg);
    margin-bottom:60px;
    /*margin-left: 20px*/
}

#viewselection button {
    font-size:20px;
}

.styleNavClose {
    width: 50px; /* 0 width - change this with JavaScript */
     /* 0.5 second transition effect to slide in the menu */
}

.styleNavOpen {
    width: 150px;
}

.styleNavOpen div {
    /*margin-left:20px;*/
}

/* The navigation menu links */
.styleNavClose a {
    padding: 8px 8px 8px 32px;
    text-decoration: none;
    font-size: 25px;
    color: #818181;
    display: block;
    transition: 0.3s;
}

#navBtn
 {
    color: white;
    font-size: 2em;
}

#navBtn:hover {
    color: darkgray;
}

.search-result:hover {
    color: darkgray;
    background-color:white;
}

/* On smaller screens, where height is less than 450px, change the style of the menu (less padding and a smaller font size) */
@media screen and (max-height: 450px) {
    .styleNavClose {padding-top: 15px;}
    .styleNavClose a {font-size: 18px;}
}
</style>
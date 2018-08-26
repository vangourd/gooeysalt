<template>
    <nav :class="{styleNavOpen: navopen, styleNavClose: !navopen}" id="menu">
        <i @click="toggleNav" class="fa text-center" :class="{'fa-arrow-circle-right': !navopen,'fa-arrow-circle-left': navopen}" id="navBtn"></i>
        <div id="viewselection"  v-if="!navopen">
           <div class="rotate-text">
               <strong >ActionBar</strong>
           </div>
           <b-btn @click="changeView('minions') " class="fa fa-cubes" variant="light"></b-btn>
           <b-btn @click="changeView('jobs')" class="fa fa-wrench" variant="light"></b-btn>
           <b-btn @click="changeView('reports')" class="fa fa-chart-line" variant="light"></b-btn> 
           <b-btn @click="changeView('cli')" class="fa fa-terminal" variant="light"></b-btn>
        </div>
        <div id="filters" v-if="navopen">
            <span>Search</span> 
            <b-form-input v-model="selection"></b-form-input>
            <b-card v-if="selection">
                    <!-- Filters -->
                    <strong>Add a filter</strong>
                    <div class="search-result">
                        <i class="fa fa-desktop"></i>
                        <span href="#"> {{ selection }}</span>
                    </div>
                    <div class="search-result">
                        <i class="fa fa-terminal"></i>
                        <span href="#">{{ selection }}</span>
                    </div>
                    <div class="search-result">
                        <i class="fa fa-undo"></i>
                        <span href="#">{{ selection }}</span>
                    </div>
                    <div class="search-result">
                        <i class="fa fa-clock"></i>
                        <span href="#">{{ selection }}</span>
                    </div>
                    <div class="search-result">
                        <i class="fa fa-tag"></i>
                        <span href="#">{{ selection }}</span>
                    </div>
            </b-card>
            <b-card>
                <strong>Applied Filters</strong>
                <div>
                        
                        <p href="#"><i class="fa fa-desktop"></i> {{ selection }}<i style="color:red" class="fa fa-times-circle"></i></p> 
                        
                        <p href="#"><i class="fa fa-tag"></i> {{ selection }} <i style="color:red" class="fa fa-times-circle"></i></p> 
                </div>
            </b-card>
        </div>
        
    </nav>
</template>

<script>
import slideout from 'slideout'

export default {
    name: 'actionbar',
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
    width: 250px;
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

.rotate-text {
    color:white;
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
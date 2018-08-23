<template>
    <nav :class="{styleNavOpen: navopen, styleNavClose: !navopen}" id="menu">
        <h2 @click="toggleNav"><i class="fa text-center" :class="{'fa-arrow-circle-right': !navopen,'fa-arrow-circle-left': navopen}"></i></h2>
    </nav>
</template>

<script>
import slideout from 'slideout'

export default {
    name: 'actionbar',
    methods: {
      toggleNav: function(){
        this.navopen = !this.navopen
      }
    },
    data() {
        return {
        state: this.$root.sharedState,
        minions: this.$root.sharedState.minions,
        navopen: false
        }
    },
}
</script>

<style scoped>
/* The side navigation menu */
#menu {
    overflow-x: hidden;
    background-color:white;
    padding-top: 10px; /* Place content 60px from the top */
    transition: 0.5s;
}

.styleNavClose {
    width: 80px; /* 0 width - change this with JavaScript */
     /* 0.5 second transition effect to slide in the menu */
}

.styleNavOpen {
    width: 200px;
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

/* When you mouse over the navigation links, change their color */
.styleNavClose i:hover {
    color: black;
}

i {
    color: green;
    margin-left:20px
}

/* On smaller screens, where height is less than 450px, change the style of the menu (less padding and a smaller font size) */
@media screen and (max-height: 450px) {
    .styleNavClose {padding-top: 15px;}
    .styleNavClose a {font-size: 18px;}
}
</style>
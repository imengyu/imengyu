<template>
  <div :class="'imengyu-header'+(dark?' dark':'')">
    <div class="imengyu-header-left"></div>
    <div class="imengyu-header-menu">
      <ul>
        <li v-for="(item, i) in homeMenu" :key="i">
          <a v-if="item.to.indexOf('http')==0" :href="item.to">{{item.name}}</a>
          <router-link v-else :to="item.to">{{item.name}}</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'Header'
})
export default class Header extends Vue {

  @Prop({default:false}) dark : boolean;

  homeMenu = [
    {
      name: 'Home',
      to: '/'
    },
    {
      name: 'Blog',
      to: 'https://blog.imengyu.top/'
    },
    {
      name: 'Works',
      to: 'Works'
    },
    {
      name: 'About',
      to: 'About'
    },
  ]

}
</script>
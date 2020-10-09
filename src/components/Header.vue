<template>
  <div class="imengyu-header">
    <div class="imengyu-header-left"></div>
    <div class="imengyu-header-menu">
      <ul>
        <li v-for="(item, i) in homeMenu" :key="i"><router-link :to="item.to">{{item.name}}</router-link></li>
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

  homeMenu = [
    {
      name: 'Home',
      to: '/'
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
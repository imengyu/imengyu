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
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Header',
  props: {
    dark: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      homeMenu: [
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
      ],
    }
  },
})
</script>
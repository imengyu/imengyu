<template>
  <div class="imengyu">
    <MyHeader :dark="darkMode"></MyHeader>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MyHeader from './components/Header.vue'
import { emitter } from './main'

export default defineComponent({
  components: {
    MyHeader,
  },
  data() {
    return {
      darkMode: false,
    } 
  },
  mounted() {
    emitter.on('updateDarkMode', (e) => {
      this.darkMode = e as boolean;
    })

    console.log(`%c欢迎来到梦鱼的小主页`, 'color:#fff;background:#56a;padding:3px 6px');
  },

})
</script>

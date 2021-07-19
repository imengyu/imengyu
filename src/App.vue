<template>
  <div class="imengyu">
    <Header :dark="darkMode"></Header>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Header from './components/Header.vue'
import { emitter } from './main'

export default defineComponent({
  components: {
    Header,
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
  },

})
</script>

<template>
  <div class="imengyu">
    <Header :dark="darkMode"></Header>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import Header from './components/Header.vue'
import { bus } from './index'

@Component({
  components: {
    Header
  }
})
export default class App extends Vue {

  darkMode = false;

  mounted() {
    setTimeout(() => {
      bus.$on('updateDarkMode', (c) => {
        this.darkMode = c;
      })
    }, 1000);
    
  }
}
</script>
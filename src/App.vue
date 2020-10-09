<template>
  <div class="imengyu">
    <Header></Header>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import Header from './components/Header.vue'

@Component({
  components: {
    Header
  }
})
export default class App extends Vue {
}
</script>
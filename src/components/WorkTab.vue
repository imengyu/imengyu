<template>
  <div class="imengyu-works-tab" ref="worksList">
    <ul>
      <li v-for="(item,i) in items" :key="i" :class="(value==item?' active':'')" @click="onClick(item)">
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

@Component({
  name: 'WorkTab'
})
export default class WorkTab extends Vue {
  @Prop({default:null}) items : Array<any>;
  @Prop({default:null}) value;

  @Watch("value") 
  onValueChanged() {
   
  }
  onClick(item) {
    this.$emit('input', item);
  }

  mounted() {
    setTimeout(() => {
    }, 100);
  }

}
</script>

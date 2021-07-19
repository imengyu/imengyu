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
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  pros: {
    items: {
      type: Object as PropType<Array<string>>,
      default: null
    },
    value: {
      type: String,
      default: null
    },
  },
  onClick(item : string) {
    this.$emit('update:value', item);
  },
})
</script>

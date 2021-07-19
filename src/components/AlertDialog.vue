<template>
  <transition enter-active-class="fadeIn" leave-active-class="fadeOut">
    <div v-show="show" class="imengyu-alert-box animated" style="animation-duration: 200ms;" @click="onOutBoxClick($event)">
      <div class="box animated zoomIn" style="animation-duration: 500ms;" @click="onBoxClick($event)">
        <div class="imengyu-content-sub-title">
          {{title}}
          <span>{{subTitle}}</span>
        </div>
        <div class="imengyu-content-box-innern pt-0">
          <slot />
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AlertDialog',
  emits: [ 'update:show' ],
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    subTitle: {
      type: String,
      default: '',
    }
  },
  methods: {
    onOutBoxClick() {
      this.$emit('update:show', false)
    },
    onBoxClick(e : MouseEvent) {
      e.cancelBubble = true;
    }
  },
})
</script>
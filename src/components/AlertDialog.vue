<template>
  <transition enter-active-class="fadeIn" leave-active-class="fadeOut">
    <div v-show="value" class="imengyu-alert-box animated" style="animation-duration: 200ms;" @click="onOutBoxClick($event)">
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
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({
  name: 'AlertDialog'
})
export default class AlertDialog extends Vue {
  @Prop({default:false}) value : boolean;
  @Prop({default:''}) title : string;
  @Prop({default:''}) subTitle : string;

  onOutBoxClick(e : MouseEvent) {
    this.$emit('input', false)
  }
  onBoxClick(e : MouseEvent) {
    e.cancelBubble = true;
  }
}
</script>